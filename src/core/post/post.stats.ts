// src/core/post/post.stats.ts
import { postQueue } from './post.queue.js'
import { ActivityJob } from './post.types.js'
import redis from '../services/redis/client.js'


export const postStats = {

async like(postId: string, userId: string): Promise<void> {
	const key = `post:${postId}:stats`
	const likedKey = `user:${userId}:liked`
	const likesKey = `post:${postId}:likes`

	// Проверяем, не лайкал ли уже пользователь
	const hasLiked = await redis.sismember(likedKey, postId)
	if (hasLiked) throw new Error('Already liked')

	// Атомарная транзакция Redis
	await redis
			.multi()
			.sadd(likedKey, postId)
			.hincrby(key, 'likes', 1)
			.zadd(likesKey, Date.now(), userId)
			.zincrby('posts:top', 1, postId)
			.exec()

	// Отправляем задачу в очередь для обновления БД
	await postQueue.add(
			'process-activity',
			{ type: 'like', postId, userId } satisfies ActivityJob
	)
},

	async view(postId: string): Promise<void> {
		await redis
			.multi()
			.hincrby(`post:${postId}:stats`, 'views', 1)
			.zincrby('posts:top', 0.001, postId)
			.exec()

		await postQueue.add('process-activity', {
			type: 'view',
			postId,
		} satisfies ActivityJob)
	},
}
