// src/core/auth/session.ts
import crypto from 'crypto'
import redis from './redis/client.js'

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 дней

export const sessionService = {
	create: async (userId: string, role: string) => {
		const sessionId = crypto.randomBytes(32).toString('hex')
		await redis.set(
			`session:${sessionId}`,
			JSON.stringify({ userId, role }),
			'EX',
			SESSION_TTL
		)
		await redis.sadd(`user:sessions:${userId}`, sessionId)
		return sessionId
	},

	getSession: async (sessionId: string) => {
		const data = await redis.get(`session:${sessionId}`)
		return data ? JSON.parse(data) : null
	},

	delete: (sessionId: string) => redis.del(`session:${sessionId}`),

	invalidateSessions: async (userId: string) => {
		const sessionIds = await redis.smembers(`user:sessions:${userId}`)
		if (!sessionIds.length) return

		const pipeline = redis.pipeline()
		sessionIds.forEach(id => pipeline.del(`session:${id}`))
		await pipeline.del(`user:sessions:${userId}`).exec()
	},
}
