// src/core/post/service.ts
import { prisma } from '../../db.js'
import redis from '../services/redis/client.js'
import { PostWithStats } from './post.types.js'

export const postService = {
	async createPost(
		userId: string,
		title: string,
		content: string,
		tags: string[] = []
	): Promise<PostWithStats> {
		return await prisma.$transaction(async tx => {
			const post = await tx.post.create({
				data: {
					title,
					content,
					authorId: userId,
					tags: {
						connectOrCreate: tags.map(tag => ({
							where: { name: tag },
							create: { name: tag },
						})),
					},
				},
				include: { tags: true },
			})

			await Promise.all([
				redis.hset(`post:${post.id}:stats`, { likes: 0, views: 0 }),
				await redis.zadd('posts:top', 0, post.id),
			])

			return {
				...post,
				likesCount: 0,
				views: 0,
			}
		})
	},

	async getPostById(postId: string): Promise<PostWithStats | null> {
		const [post, stats] = await Promise.all([
			prisma.post.findUnique({
				where: { id: postId },
				include: { author: true, tags: true },
			}),
			redis.hgetall(`post:${postId}:stats`),
		])

		if (!post) return null

		return {
			...post,
			likesCount: parseInt(stats.likes || '0'),
			views: parseInt(stats.views || '0'),
		}
	},

	async updatePost(
		id: string,
		userId: string,
		data: { title?: string; content?: string; tags?: string[] }
	) {
		return await prisma.post.update({
			where: {
				id,
				authorId: userId
			},
			data: {
				title: data.title,
				content: data.content,
				tags: data.tags && {
					connectOrCreate: data.tags.map(tag => ({
						where: { name: tag },
						create: { name: tag }
					}))
				}
			}
		})
	},

	async deletePost(id: string, userId: string) {
		await prisma.post.delete({ where: { id, authorId: userId } })
		await redis.zrem('posts:top', id)
	},

	async getTopPosts(limit: number = 10): Promise<PostWithStats[]> {
		// const cached = await redis.get('cache:top-posts')
		// if (cached) return JSON.parse(cached)

		// Получаем ID постов по убыванию рейтинга
		const topPostIds = await redis.zrevrange('posts:top', 0, limit - 1)
		if (!topPostIds.length) return []

		// Получаем все посты из базы
		const posts = await prisma.post.findMany({
			where: { id: { in: topPostIds } },
			include: {
				author: true,
				tags: true,
			},
		})

		// Создаем map для быстрого доступа
		const postMap = new Map(posts.map(post => [post.id, post]))

		// Восстанавливаем порядок из Redis
		const orderedPosts = topPostIds
			.map(id => postMap.get(id))
			.filter(post => post !== undefined) as PostWithStats[]

		// Добавляем статистику из Redis
		const statsList = await Promise.all(
			orderedPosts.map(post => redis.hgetall(`post:${post.id}:stats`))
		)

		// Присоединяем просмотры и лайки к каждому посту
		const result = orderedPosts.map((post, index) => ({
			...post,
			likesCount: parseInt(statsList[index]?.likes || '0'),
			views: parseInt(statsList[index]?.views || '0'),
		}))

		// Кэшируем результат
		await redis.set('cache:top-posts', JSON.stringify(result), 'EX', 3600)

		return result
	},
}
