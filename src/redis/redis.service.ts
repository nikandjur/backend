import redis from '../config/redis.js'

export const RedisService = {
	// Простая установка строки с TTL
	set: async (key: string, value: string, ttlSeconds?: number) => {
		if (ttlSeconds) {
			await redis.set(key, value, 'EX', ttlSeconds)
		} else {
			await redis.set(key, value)
		}
	},

	get: async (key: string): Promise<string | null> => {
		return await redis.get(key)
	},

	del: async (key: string): Promise<number> => {
		return await redis.del(key)
	},

	// Работа с JSON-данными
	setJSON: async (key: string, value: unknown, ttlSeconds?: number) => {
		const stringified = JSON.stringify(value)
		await RedisService.set(key, stringified, ttlSeconds)
	},

	getJSON: async <T>(key: string): Promise<T | null> => {
		const result = await redis.get(key)
		if (!result) return null
		try {
			return JSON.parse(result) as T
		} catch (e) {
			console.error(`Error parsing JSON from Redis key "${key}"`, e)
			return null
		}
	},

	// Специализированный метод для блэклиста
	setBlacklistToken: async (token: string, ttl: number) => {
		await redis.set(`bl_${token}`, '1', 'EX', ttl)
	},

	isTokenBlacklisted: async (token: string): Promise<boolean> => {
		const result = await redis.get(`bl_${token}`)
		return !!result
	},
}
