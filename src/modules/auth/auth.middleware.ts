import { NextFunction, Request, Response } from 'express'
import { RedisService } from '../../redis/redis.service'

/**
 * Мидлвар для аутентификации через сессии
 */
export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Извлекаем sessionId из cookies
		const sessionId = req.cookies?.sessionId

		if (!sessionId) {
			 res.status(401).json({ error: 'No session cookie' })
			 return
		}

		// Получаем сессию из Redis
		const session = await RedisService.getJSON<{ userId: string }>(sessionId)

		if (!session) {
			 res.status(401).json({ error: 'Invalid session' })
			 return
		}

		// Присваиваем userId в объект запроса
		req.user = { id: session.userId }

		// Переходим к следующему мидлвару или обработчику
		next()
	} catch (error) {
		console.error('❌ Error during authentication:', error)
		 res.status(500).json({ error: 'Internal server error' })
		 return
	}
}
