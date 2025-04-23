import { randomUUID } from 'crypto'
import { redisService } from '../../redis/redis.service.js'
import { comparePassword, hashPassword } from '../../utils/password.utils.js'

// Конфигурация сессий
const SESSION_CONFIG = {
	ttl: 60 * 60 * 24 * 7, // 7 дней
}

// Функция для генерации и сохранения сессионных данных в Redis
export const createSession = async (userId: string): Promise<string> => {
	const sessionId = generateSessionId()

	// Сохраняем сессию в Redis с временем жизни
	await redisService.setJSON(sessionId, { userId }, SESSION_CONFIG.ttl)

	return sessionId
}

// Генерация уникального sessionId
const generateSessionId = () => {
	return randomUUID()
}

export { comparePassword, hashPassword }
