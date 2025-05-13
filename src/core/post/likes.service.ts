import redis from '../services/redis/client.js'

export const likesService = {
	async likePost(postId: string, userId: string) {
		await redis.zadd(`post:${postId}:likes`, Date.now(), userId)
		await redis.zincrby('posts:top', 1, postId)
	},
}
