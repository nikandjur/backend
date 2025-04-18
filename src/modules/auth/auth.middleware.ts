import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AuthJwtPayload } from '../../types/jwt'
import { RedisService } from '../../redis/redis.service.js'

const ACCESS_SECRET = process.env.JWT_SECRET || ''

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const authHeader = req.headers.authorization

	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Access token required' })
		return
	}

	const token = authHeader.split(' ')[1]

	try {
		const isBlacklisted = await RedisService.isTokenBlacklisted(token)
		if (isBlacklisted) {
			res.status(401).json({ error: 'Token blacklisted' })
			return
		}

		const payload = jwt.verify(token, ACCESS_SECRET) as AuthJwtPayload
		req.user = payload
		next()
	} catch (err) {
		res.status(401).json({ error: 'Invalid or expired token' })
	}
}
