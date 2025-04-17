import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import Redis from 'ioredis'
import { AuthJwtPayload } from 'types/jwt'

const redis = new Redis()
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!

/**
 * 🔐 Middleware для защиты маршрутов
 * - Проверяет наличие access токена
 * - Валидирует его
 * - Проверяет blacklisted ли токен
 * - Добавляет данные пользователя в req.user
 */
export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization

	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Access token required' })
		return
	}

	const token = authHeader.split(' ')[1]

	const isBlacklisted = await redis.get(`bl_${token}`)
	if (isBlacklisted) {
		res.status(401).json({ error: 'Token blacklisted' })
		return
	}

	try {
		const payload = jwt.verify(token, ACCESS_SECRET) as AuthJwtPayload
		req.user = payload
		next()
	} catch (err) {
		res.status(401).json({ error: 'Invalid or expired token' })
	}
}

