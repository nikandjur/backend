import redis from '../config/redis.js'

// Сервис для работы с Redis
export const RedisService = {
	// Установка строки с TTL
	set: async (key: string, value: string, ttlSeconds?: number) => {
		try {
			if (ttlSeconds) {
				await redis.set(key, value, 'EX', ttlSeconds) // Устанавливаем строку с TTL
			} else {
				await redis.set(key, value) // Устанавливаем строку без TTL
			}
		} catch (err) {
			console.error(`❌ Error setting key "${key}" in Redis:`, err)
		}
	},

	// Получение строки по ключу
	get: async (key: string): Promise<string | null> => {
		try {
			return await redis.get(key)
		} catch (err) {
			console.error(`❌ Error getting key "${key}" from Redis:`, err)
			return null
		}
	},

	// Удаление ключа
	del: async (key: string): Promise<number> => {
		try {
			return await redis.del(key)
		} catch (err) {
			console.error(`❌ Error deleting key "${key}" from Redis:`, err)
			return 0
		}
	},

	// Работа с JSON-данными
	setJSON: async (key: string, value: unknown, ttlSeconds?: number) => {
		try {
			const stringified = JSON.stringify(value)
			await RedisService.set(key, stringified, ttlSeconds)
		} catch (err) {
			console.error(`❌ Error setting JSON for key "${key}":`, err)
		}
	},

	getJSON: async <T>(key: string): Promise<T | null> => {
		try {
			const result = await redis.get(key)
			if (!result) return null
			return JSON.parse(result) as T
		} catch (err) {
			console.error(`❌ Error parsing JSON from Redis key "${key}":`, err)
			return null
		}
	},

	// Специализированный метод для блэклиста токенов
	setBlacklistToken: async (token: string, ttl: number) => {
		try {
			await redis.set(`bl_${token}`, '1', 'EX', ttl) // Устанавливаем токен в черный список с TTL
		} catch (err) {
			console.error(`❌ Error setting blacklisted token "${token}":`, err)
		}
	},

	// Проверка на наличие токена в черном списке
	isTokenBlacklisted: async (token: string): Promise<boolean> => {
		try {
			const result = await redis.get(`bl_${token}`)
			return !!result // Возвращаем true, если токен в черном списке
		} catch (err) {
			console.error(`❌ Error checking blacklisted token "${token}":`, err)
			return false
		}
	},
}
