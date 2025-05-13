import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisma } from '../../db.js'
import { logger } from '../services/logger.js'
import { sessionService } from './session.js'

export const sessionMiddleware: RequestHandler = async (req, res, next) => {
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
			select: {
				id: true,
				email: true,
				name: true,
				emailVerified: true,
			},
		})

		if (user) {
			req.user = {
				...user,
				role: session.role,
			}
		}

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
