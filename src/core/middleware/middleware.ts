import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisma } from '../../db.js'
import { sessionService } from '../auth/session.js'
import { logger } from '../services/logger.js'
import redis from '../services/redis/client.js'

export const sessionMiddleware: RequestHandler = async (req, res, next) => {
	const sessionId = req.cookies?.sessionId
	if (!sessionId) return next()

	try {
		// Используем новый метод getSession
		const session = await sessionService.getSession(sessionId)
		if (!session?.userId) {
			res.clearCookie('sessionId')
			return next()
		}

		// Кешируем пользователя (пример на 1 минуту)
		const user = await redis.get(`user:${session.userId}`).then(data =>
			data
				? JSON.parse(data)
				: prisma.user
						.findUnique({ where: { id: session.userId } })
						.then(user => {
							redis.set(
								`user:${session.userId}`,
								JSON.stringify(user),
								'EX',
								60
							)
							return user
						})
		)

		if (user) req.user = { ...user, role: session.role }
		next()
	} catch (error) {
		logger.error('Session validation failed', { error })
		next()
	}
}

export const authenticate: RequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.user) {
		res.status(401).json({ error: 'Authentication required' })
		return
	}
	next()
}
export const checkRole =
	(role: string): RequestHandler =>
	(req: Request, res: Response, next: NextFunction) => {
		if (!req.user?.role || req.user.role !== role) {
			res.status(403).json({ error: 'Forbidden' })
			return
		}
		next()
	}
