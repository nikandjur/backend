// src/core/services/redis/service.ts
import redis from './client.js'

export const redisService = {
	// Универсальные методы
	set: (key: string, value: string, ttl?: number) =>
		ttl ? redis.set(key, value, 'EX', ttl) : redis.set(key, value),
	get: (key: string) => redis.get(key),
	del: (key: string) => redis.del(key),
	keys: (pattern: string) => redis.keys(pattern),

	// Специализированные методы (для удобства)
	setVerificationToken: (token: string, userId: string, ttl: number) =>
		redis.set(`email-verification:${token}`, userId, 'EX', ttl),

	getVerificationToken: (token: string) =>
		redis.get(`email-verification:${token}`),

	deleteVerificationToken: (token: string) =>
		redis.del(`email-verification:${token}`),

	// Оставляем как есть, но оптимизируем:
	// setSession: (sessionId: string, data: object, ttl: number) =>
	// 	redis.set(`session:${sessionId}`, JSON.stringify(data), 'EX', ttl),

	setSession: async (sessionId: string, data: object, ttl: number) => {
		await redis.hset(`session:${sessionId}`, data)
		await redis.expire(`session:${sessionId}`, ttl)
	},

	smembers: (key: string) => redis.smembers(key), 
}
