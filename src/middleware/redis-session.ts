import { Request, Response, NextFunction } from 'express'
import { redisService } from '../redis/redis.service.js'

export const redisSession =
	() => async (req: Request, res: Response, next: NextFunction) => {
		const sessionId = req.cookies?.sessionId
		if (!sessionId) return next()

		try {
			const session = await redisService.getJSON<{ userId: string }>(
				`sessions:${sessionId}`
			)
			if (session?.userId) {
				req.user = { id: session.userId, email: '', name: '' } // Укажите нужные поля пользователя
				// Если нужно, можно добавить дополнительные данные пользователя из БД
			}
			next()
		} catch (error) {
			next(error)
		}
	}
