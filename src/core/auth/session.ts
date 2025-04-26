import { logger } from '../services/logger.js'
import { redisService } from '../services/redis/service.js'

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 дней

export const createSession = async (userId: string): Promise<string> => {
	const sessionId = crypto.randomUUID()
	await redisService.setJSON(`sessions:${sessionId}`, { userId }, SESSION_TTL)
	logger.debug('Session created', { userId, sessionId })
	return sessionId
}

export const validateSession = async (sessionId: string) => {
	const session = await redisService.getJSON<{ userId: string }>(
		`sessions:${sessionId}`
	)
	if (!session) {
		logger.warn('Invalid session attempt', { sessionId })
		return null
	}
	return session
}

export const deleteSession = async (sessionId: string) => {
	await redisService.deleteSession(sessionId)
}
