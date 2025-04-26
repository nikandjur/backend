import { Request, Response, NextFunction } from 'express'
import { validateSession } from './session.js'
import { logger } from '../services/logger.js'
import { prisma } from '../../db.js'
import { handleError } from '../utils/errorHandler'

// Для публичных роутов (добавляет user если есть)
export const sessionMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const sessionId = req.cookies?.sessionId
	if (!sessionId) return next()

	try {
		const session = await validateSession(sessionId)
		if (!session?.userId) {
			logger.warn('Invalid session attempt', { sessionId })
			return next()
		}

		const user = await prisma.user.findUnique({
			where: { id: session.userId },
			select: { id: true, email: true, name: true },
		})

		if (user) req.user = user
		next()
	} catch (error) {
		logger.error('Session validation failed', { error })
		next()
	}
}

// Для защищённых роутов (требует авторизации)
export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.user) {
		return handleError(res, 'Authentication required', 401)
	}
	next()
}
// Проверка верификации email
export const checkEmailVerified = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.user) {
		return handleError(res, 'Authentication required', 401)
	}

	const user = await prisma.user.findUnique({
		where: { id: req.user.id },
		select: { emailVerified: true },
	})

	if (!user?.emailVerified) {
		return handleError(res, 'Email verification required', 403)
	}

	next()
}