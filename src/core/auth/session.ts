import crypto from 'crypto'
import redis from '../services/redis/client.js'
import { redisService } from '../services/redis/service.js'

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 дней

export const sessionService = {
	create: async (userId: string, role: string) => {
		const sessionId = crypto.randomBytes(32).toString('hex')
		await redisService.set(
			`session:${sessionId}`,
			JSON.stringify({ userId, role }),
			SESSION_TTL
		)
		await redis.sadd(`user:sessions:${userId}`, sessionId)
		return sessionId
	},

	getSession: async (sessionId: string) => {
		const data = await redisService.get(`session:${sessionId}`)
		return data ? JSON.parse(data) : null
	},

	validate: async (sessionId: string) => {
		const data = await redisService.get(`session:${sessionId}`)
		if (!data) return null
		return JSON.parse(data) as { userId: string; role: string }
	},

	delete: (sessionId: string) => redisService.del(`session:${sessionId}`),

	invalidateSessions: async (userId: string) => {
		const sessionIds = await redisService.smembers(`user:sessions:${userId}`)
		const pipeline = redis.pipeline()

		sessionIds.forEach(id => {
			pipeline.del(`session:${id}`)
		})

		await pipeline.del(`user:sessions:${userId}`).exec()
	},
}
