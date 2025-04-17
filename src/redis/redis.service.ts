import Redis from 'ioredis'

const redis = new Redis()

export const RedisService = {
	setBlacklistToken: async (token: string, ttl: number) => {
		await redis.set(`bl_${token}`, '1', 'EX', ttl)
	},

	isTokenBlacklisted: async (token: string): Promise<boolean> => {
		const result = await redis.get(`bl_${token}`)
		return !!result
	},
}
