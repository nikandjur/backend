import { Worker } from 'bullmq'
import { prisma } from '../../db.js'
import redis from '../services/redis/client.js'

// src/core/worker/likes.worker.ts
const worker = new Worker(
	'likes-transfer',
	async job => {
		// 1. Получаем все лайки из временного хранилища
		const postLikes = await redis.zrange('posts:likes', 0, -1, 'WITHSCORES')

		// 2. Обрабатываем в транзакции
		await prisma.$transaction(async tx => {
			for (let i = 0; i < postLikes.length; i += 2) {
				const postId = postLikes[i]
				const likesToAdd = parseInt(postLikes[i + 1], 10)

				// 3. Обновляем PostgreSQL
				await tx.post.update({
					where: { id: postId },
					data: { likes: { increment: likesToAdd } },
				})

				// 4. Обновляем рейтинг в Redis (лайки + 20% от просмотров)
				const post = await tx.post.findUnique({
					where: { id: postId },
					select: { views: true },
				})
				const score = likesToAdd + (post?.views || 0) * 0.2
				await redis.zadd('posts:top', score, postId)
			}

			// 5. Очищаем временное хранилище
			await redis.del('posts:likes')

			// Перенесено внутрь обработчика
			const popularTags = await redis.zrevrange('popular-tags', 0, 49)
			await redis.set(
				'cache:popular-tags',
				JSON.stringify(popularTags),
				'EX',
				86400
			)
		})
	},
	{
		connection: redis,
		autorun: true,
		limiter: {
			max: 1,
			duration: 60 * 60 * 1000, // 1 раз в час
		},
	}
)
