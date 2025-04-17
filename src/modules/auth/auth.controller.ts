import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { RedisService } from 'redis/redis.service'
import { JwtUtils } from 'utils/jwt.utils'
import { loginSchema, registerSchema } from './auth.schema'
import { AuthService } from './auth.service'
import { signTokens } from './auth.utils'


const service = new AuthService()

export const refresh = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { refreshToken } = req.body

	if (!refreshToken) {
		res.status(400).json({ error: 'Refresh token required' })
		return
	}

	try {
		// const payload = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload
		const payload = JwtUtils.verifyRefreshToken(refreshToken) as jwt.JwtPayload

		const isBlacklisted = await RedisService.isTokenBlacklisted(refreshToken)
		if (isBlacklisted) {
			res.status(401).json({ error: 'Refresh token blacklisted' })
			return
		}

		const newTokens = signTokens(payload.sub as string)
		res.status(200).json(newTokens)
	} catch (err) {
		res.status(401).json({ error: 'Invalid refresh token' })
	}
}

export const logout = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const authHeader = req.headers.authorization

	if (!authHeader?.startsWith('Bearer ')) {
		res.status(400).json({ error: 'Token required' })
		return
	}

	const token = authHeader.split(' ')[1]

	try {
		// const decoded = jwt.decode(token) as jwt.JwtPayload
		const decoded = JwtUtils.decodeToken(token) as jwt.JwtPayload
		const exp = decoded?.exp

		if (exp) {
			const ttl = exp - Math.floor(Date.now() / 1000)
			await RedisService.setBlacklistToken(token, ttl)
		}

		res.status(200).json({ message: 'Logged out successfully' })
	} catch (err) {
		res.status(400).json({ error: 'Invalid token' })
	}
}

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const data = registerSchema.parse(req.body)
		const result = await service.register(data.email, data.password, data.name)
		res.status(201).json(result)
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
}

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const data = loginSchema.parse(req.body)
		const result = await service.login(data.email, data.password)
		res.status(200).json(result)
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
}
