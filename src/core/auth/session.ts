import crypto from 'crypto'
import { redisService } from '../services/redis/service.js'
import { logger } from '../services/logger.js'

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 дней

export const sessionService = {
	create: async (userId: string) => {
		const sessionId = crypto.randomBytes(32).toString('hex')
		await redisService.set(`session:${sessionId}`, userId, SESSION_TTL)
		logger.debug('Session created', { userId, sessionId })
		return sessionId
	},

	validate: async (sessionId: string) => {
		const userId = await redisService.get(`session:${sessionId}`)
		if (!userId) {
			logger.warn('Invalid session attempt', { sessionId })
			return null
		}
		return { userId }
	},

	delete: (sessionId: string) => redisService.del(`session:${sessionId}`),
}
