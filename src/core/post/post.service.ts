// src/core/post/service.ts
import { prisma } from '../../db.js'
import redis from '../services/redis/client.js'
import { PostWithStats } from './post.types.js'

export const postService = {
	async createPost(
		userId: string,
		title: string,
		content: string
	): Promise<PostWithStats> {
		const post = await prisma.post.create({
			data: { title, content, authorId: userId },
			include: {
				author: { select: { id: true, name: true, avatarUrl: true } },
			},
		})

		await redis
			.multi()
			.hset(`post:${post.id}:stats`, 'likes', 0, 'views', 0)
			.zadd('posts:top', 0, post.id)
			.exec()

		return {
			...post,
			likes: 0,
			views: 0,
			// Явно указываем author, так как include уже добавил его
			author: {
				id: post.author.id,
				name: post.author.name,
				avatarUrl: post.author.avatarUrl,
			},
		}
	},

	async getPostById(postId: string): Promise<PostWithStats | null> {
		const [post, [likes, views]] = await Promise.all([
			prisma.post.findUnique({
				where: { id: postId },
				include: {
					author: { select: { id: true, name: true, avatarUrl: true } },
				},
			}),
			redis.hmget(`post:${postId}:stats`, 'likes', 'views'),
		])

		if (!post) return null

		return {
			...post,
			likes: parseInt(likes || '0'),
			views: parseInt(views || '0'),
			author: {
				id: post.author.id,
				name: post.author.name,
				avatarUrl: post.author.avatarUrl,
			},
		}
	},

	async updatePost(
		id: string,
		userId: string,
		data: { title?: string; content?: string }
	) {
		return prisma.post.update({
			where: { id, authorId: userId },
			data,
		})
	},

	async deletePost(id: string, userId: string) {
		// 1. Проверяем существует ли пост вообще
		const postExists = await prisma.post.findUnique({
			where: { id },
		})

		if (!postExists) {
			throw new Error('POST_NOT_FOUND')
		}

		// 2. Проверяем принадлежит ли пользователю
		const isOwner = await prisma.post.findUnique({
			where: { id, authorId: userId },
		})

		if (!isOwner) {
			throw new Error('NOT_POST_OWNER')
		}

		// 3. Если все проверки пройдены - удаляем
		await Promise.all([
			prisma.post.delete({ where: { id } }),
			redis.del(`post:${id}`),
			redis.zrem('posts:top', id),
		])
	},

	async getTopPosts(limit: number = 10): Promise<PostWithStats[]> {
		// 1. Получаем ID топ-постов из Redis
		const ids: string[] = await redis.zrevrange('posts:top', 0, limit - 1)
		if (!ids.length) return []

		// 2. Получаем посты из базы данных
		const posts = await prisma.post.findMany({
			where: { id: { in: ids } },
			include: {
				author: {
					select: {
						id: true,
						name: true,
						avatarUrl: true,
					},
				},
			},
		})

		// 3. Создаем pipeline для получения статистики
		const pipeline = redis.pipeline()
		ids.forEach((id: string) => pipeline.hmget(`post:${id}`, 'likes', 'views'))
		const stats = await pipeline.exec()
		if (!stats) {
			throw new Error('Failed to retrieve post stats from Redis')
		}
		// 4. Формируем результат, используя reduce или предварительную фильтрацию
		const result: PostWithStats[] = []

		for (const [index, id] of ids.entries()) {
			const post = posts.find(p => p.id === id)
			if (!post) continue

			const [err, data] = stats[index] ?? []

			if (err) {
				console.error(`Error fetching stats for post ID ${id}:`, err)
				continue
			}

			let likes = 0
			let views = 0

			if (Array.isArray(data)) {
				likes = parseInt((data[0] as string) ?? '0', 10)
				views = parseInt((data[1] as string) ?? '0', 10)
			}

			result.push({
				...post,
				likes,
				views,
			})
		}

		return result
	},
}
