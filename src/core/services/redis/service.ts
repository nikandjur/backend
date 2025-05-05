// src/core/services/redis/service.ts
import redis from './client.js'

export const redisService = {
	// Универсальные методы
	set: (key: string, value: string, ttl?: number) =>
		ttl ? redis.set(key, value, 'EX', ttl) : redis.set(key, value),

	get: (key: string) => redis.get(key),

	del: (key: string) => redis.del(key),

	// Специализированные методы (для удобства)
	setVerificationToken: (token: string, userId: string, ttl: number) =>
		redis.set(`email-verification:${token}`, userId, 'EX', ttl),

	getVerificationToken: (token: string) =>
		redis.get(`email-verification:${token}`),

	deleteVerificationToken: (token: string) =>
		redis.del(`email-verification:${token}`),
}
