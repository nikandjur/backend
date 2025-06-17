import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisma } from '../../db.js'
import { logger } from '../services/logger.js'
import redis from '../services/redis/client.js'


export const sessionMiddleware: RequestHandler = async (req, res, next) => {
    const sessionId = req.cookies?.sessionId
    if (!sessionId) return next()

    try {
        const sessionKey = `session:${sessionId}`
        const sessionData = await redis.get(sessionKey)

        if (!sessionData) {
            res.clearCookie('sessionId')
            return next()
        }

        const session = JSON.parse(sessionData)
        if (!session.userId) {
            res.clearCookie('sessionId')
            return next()
        }

        // Проверяем, есть ли пользователь в кэше
        const cachedUser = await redis.get(`user:${session.userId}`)
        let user = cachedUser ? JSON.parse(cachedUser) : null

        if (!user) {
            user = await prisma.user.findUnique({
                where: { id: session.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                    website: true,
                    emailVerified: true,
                },
            })

            if (user) {
                await redis.set(`user:${session.userId}`, JSON.stringify(user), 'EX', 60)
            }
        }

        if (!user) {
            res.clearCookie('sessionId')
            return next()
        }

        req.user = { ...user, role: session.role }

        next()
    } catch (error) {
        logger.error('Session validation failed', { error })
        res.clearCookie('sessionId')
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
