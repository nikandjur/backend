import { Request, Response, NextFunction } from 'express'
import  redis  from '../config/redis.js'

export const redisSession =
	() => async (req: Request, res: Response, next: NextFunction) => {
		const sessionId = req.cookies?.sessionId

		if (!sessionId) return next()

		try {
			const session = await redis.get(`sessions:${sessionId}`)
			if (session) {
				req.user = JSON.parse(session)
			}
			next()
		} catch (err) {
			next(err)
		}
	}
