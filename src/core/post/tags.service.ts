import redis from '../services/redis/client.js'

export const tagsService = {
	async getPopularTags() {
		const cached = await redis.get('cache:popular-tags')
		if (cached) return JSON.parse(cached)

		const tags = await redis.zrevrange('popular-tags', 0, 49)
		return tags
	},

	async updateTagPopularity(tagName: string) {
		await redis.zincrby('popular-tags', 1, tagName)
	},
}
