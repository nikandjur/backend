import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../db.js'
import { logger } from '../services/logger.js'
import { sessionService } from './session.js'

export const sessionMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const sessionId = req.cookies?.sessionId
	if (!sessionId) return next()

	try {
		const session = await sessionService.validate(sessionId)
		if (!session) {
			res.clearCookie('sessionId')
			return next()
		}

		const user = await prisma.user.findUnique({
			where: { id: session.userId },
			select: { id: true, email: true, name: true, emailVerified: true },
		})

		if (user) req.user = user
		next()
	} catch (error) {
		logger.error('Session validation failed', { error })
		next()
	}
}

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	if (!req.user) {
		res.status(401).json({ error: 'Authentication required' })
		return // Явный return без значения
	}
	next()
}
