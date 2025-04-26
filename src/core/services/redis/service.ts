import redis from './client.js'

export const redisService = {
	// Сессии
	setSession: (sessionId: string, userId: string, ttl: number) =>
		redis.set(`sessions:${sessionId}`, userId, 'EX', ttl),

	getSession: (sessionId: string) => redis.get(`sessions:${sessionId}`),

	deleteSession: (sessionId: string) => redis.del(`sessions:${sessionId}`),

	// Общие методы
	setJSON: async (key: string, value: unknown, ttl?: number) => {
		const data = JSON.stringify(value)
		return ttl ? redis.set(key, data, 'EX', ttl) : redis.set(key, data)
	},

	getJSON: async <T>(key: string): Promise<T | null> => {
		const data = await redis.get(key)
		return data ? JSON.parse(data) : null
	},

	// Специальные методы
	setWithExpire: async (
		key: string,
		value: string,
		ttl: number
	): Promise<'OK' | null> => {
		return redis.set(key, value, 'EX', ttl)
	},
}
