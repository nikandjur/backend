// src/core/services/session.service.ts
import redis from './redis/client.js'
import crypto from 'crypto'

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 дней

export const sessionService = {
	create: async (userId: string): Promise<{ sessionId: string }> => {
		const sessionId = crypto.randomBytes(32).toString('hex')
		await redis.set(
			`session:${sessionId}`,
			JSON.stringify({ userId }),
			'EX',
			SESSION_TTL
		)
		return { sessionId }
	},

	validateSession: async (
		sessionId: string,
		userId: string
	): Promise<boolean> => {
		const data = await redis.get(`session:${sessionId}`)
		if (!data) return false
		const session = JSON.parse(data)
		return session.userId === userId
	},

	invalidateSession: async (sessionId: string): Promise<void> => {
		await redis.del(`session:${sessionId}`)
	},
}
