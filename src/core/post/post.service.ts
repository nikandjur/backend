// src/core/post/service.ts
import { prisma } from '../../db.js'
import redis from '../services/redis/client.js'
import { tagsService } from './tags.service.js'

export const postService = {
	async createPostWithTags(
		userId: string,
		title: string,
		content: string,
		tags: string[] = []
	) {
		return await prisma.$transaction(async tx => {
			const post = await tx.post.create({
				data: { title, content, authorId: userId },
			})

			const tagEntities = await Promise.all(
				tags.map(tagName =>
					tx.tag.upsert({
						where: { name: tagName },
						update: {},
						create: { name: tagName },
					})
				)
			)

			await tx.postTag.createMany({
				data: tagEntities.map(tag => ({
					postId: post.id,
					tagId: tag.id,
				})),
			})

			await redis.zadd('posts:top', 0, post.id)
			return post
		})
	},

	// В postService.getPostById():
	async getPostById(id: string, userId?: string) {
		// Сначала проверяем существование поста
		const postExists = await prisma.post.findUnique({
			where: { id },
			select: { id: true },
		})

		if (!postExists) {
			return null // Явно возвращаем null для несуществующих постов
		}

		// Получаем полные данные поста
		const post = await prisma.post.findUnique({
			where: { id },
			include: {
				author: true,
				tags: {
					include: {
						tag: true,
					},
				},
			},
		})

		if (userId && post) {
			// Асинхронно обновляем метрики без ожидания
			Promise.all([
				...post.tags.map(tag =>
					redis.zincrby(`user:${userId}:tags`, 1, tag.tag.name)
				),
				...post.tags.map(tag => tagsService.updateTagPopularity(tag.tag.name)),
			]).catch(err =>
				console.error(`Failed to update metrics for post ${id}:`, err)
			)
		}

		return post
	},

	async updatePost(
		id: string,
		userId: string,
		data: { title?: string; content?: string }
	) {
		return await prisma.post.update({
			where: { id, authorId: userId },
			data,
		})
	},

	async deletePost(id: string, userId: string) {
		await prisma.post.delete({ where: { id, authorId: userId } })
		await redis.zrem('posts:top', id)
	},

	async getTopPosts(limit: number = 10) {
		const cached = await redis.get('cache:top-posts')
		if (cached) return JSON.parse(cached)

		// Получаем топ постов из Redis
		const topPostIds = await redis.zrevrange('posts:top', 0, limit - 1)

		// Получаем полные данные о постах
		const posts = await prisma.post.findMany({
			where: { id: { in: topPostIds } },
			include: {
				author: true,
				tags: {
					include: {
						tag: true,
					},
				},
			},
		})

		// Кешируем результат на 1 час
		await redis.set('cache:top-posts', JSON.stringify(posts), 'EX', 3600)

		return posts
	},

	async getRecommendedPosts(userId: string, limit: number = 5) {
		// 1. Получаем топ-5 тегов пользователя из Redis
		const userTags = await redis.zrevrange(
			`user:${userId}:tags`,
			0,
			4,
			'WITHSCORES'
		)

		if (userTags.length === 0) {
			// Если нет данных о предпочтениях, возвращаем просто популярные посты
			const topPosts = await redis.zrevrange('posts:top', 0, limit - 1)
			return await prisma.post.findMany({
				where: { id: { in: topPosts } },
				include: {
					author: true,
					tags: {
						include: {
							tag: true,
						},
					},
				},
			})
		}

		// 2. Ищем посты с этими тегами
		const posts = await prisma.post.findMany({
			where: {
				tags: {
					some: {
						tag: {
							name: {
								in: userTags.filter((_, i) => i % 2 === 0), // берем только имена тегов (каждый второй элемент)
							},
						},
					},
				},
			},
			take: limit,
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				author: true,
				tags: {
					include: {
						tag: true,
					},
				},
			},
		})

		return posts
	},
	//инкремент просмотров:
	async incrementViews(postId: string) {
		try {
			// Используем updateMany чтобы избежать ошибок при отсутствии поста
			await prisma.post.updateMany({
				where: { id: postId },
				data: { views: { increment: 1 } },
			})
			await redis.zincrby('posts:top', 0.2, postId)
		} catch (err) {
			console.error(`Failed to increment views for post ${postId}:`, err)
		}
	},

	async likePost(postId: string, userId: string) {
		// 1. Проверяем, не лайкал ли уже пользователь
		const existingLike = await redis.zscore(`post:${postId}:likes`, userId)
		if (existingLike) throw new Error('Already liked')

		// 2. Добавляем лайк в Redis
		await redis.zadd(`post:${postId}:likes`, Date.now(), userId)

		// 3. Обновляем рейтинг в топе
		await redis.zincrby('posts:top', 1, postId)
	},

	async unlikePost(postId: string, userId: string) {
		// 1. Удаляем лайк из Redis
		const removed = await redis.zrem(`post:${postId}:likes`, userId)
		if (!removed) throw new Error('Like not found')

		// 2. Уменьшаем рейтинг в топе
		await redis.zincrby('posts:top', -1, postId)
	},
}
