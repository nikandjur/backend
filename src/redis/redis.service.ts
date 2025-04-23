import redis from '../config/redis'

export const redisService = {
	// Базовые операции
	set: async (
		key: string,
		value: string,
		ttl?: number
	): Promise<'OK' | null> => {
		return ttl ? redis.set(key, value, 'EX', ttl) : redis.set(key, value)
	},

	get: async (key: string): Promise<string | null> => {
		return redis.get(key)
	},

	del: async (key: string): Promise<number> => {
		return redis.del(key)
	},

	// JSON операции
	setJSON: async (
		key: string,
		value: unknown,
		ttl?: number
	): Promise<'OK' | null> => {
		const stringValue = JSON.stringify(value)
		return ttl
			? redis.set(key, stringValue, 'EX', ttl)
			: redis.set(key, stringValue)
	},

	getJSON: async <T>(key: string): Promise<T | null> => {
		const data = await redis.get(key)
		return data ? (JSON.parse(data) as T) : null
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
