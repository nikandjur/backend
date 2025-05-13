import redis from '../services/redis/client.js'

export const topPostService = {
	async updateTopPost(postId: string, score: number) {
		await redis.zadd('posts:top', score, postId)
	},

	async getTopPosts(limit: number = 10) {
		return await redis.zrevrange('posts:top', 0, limit - 1, 'WITHSCORES')
	},
}
