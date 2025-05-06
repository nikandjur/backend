import crypto from 'crypto'
import geoip from 'geoip-lite'
import redis from '../services/redis/client.js'
import { redisService } from '../services/redis/service.js'

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 дней

export const sessionService = {
	create: async (userId: string, role: string, ip: string | undefined) => {
		const sessionId = crypto.randomBytes(32).toString('hex')
		const geo = ip ? geoip.lookup(ip) : null // Проверяем наличие IP

		await redisService.set(
			`session:${sessionId}`,
			JSON.stringify({
				userId,
				role,
				ip: ip || null, // Сохраняем как null если IP нет
				country: geo?.country || null,
			}),
			SESSION_TTL
		)

		return sessionId // Возвращаем sessionId для установки в cookie
	},

	validate: async (sessionId: string) => {
		const data = await redisService.get(`session:${sessionId}`)
		if (!data) return null
		return JSON.parse(data) as { userId: string; role: string }
	},

	delete: (sessionId: string) => redisService.del(`session:${sessionId}`),

	invalidateSessions: async (userId: string) => {
		const keys = await redisService.keys('session:*')
		const pipeline = redis.pipeline() // Используем pipeline для эффективности

		for (const key of keys) {
			const data = await redisService.get(key)
			if (data && JSON.parse(data).userId === userId) {
				pipeline.del(key) // Добавляем в pipeline вместо immediate exec
			}
		}

		await pipeline.exec() // Выполняем все удаления одним запросом
	},
}
