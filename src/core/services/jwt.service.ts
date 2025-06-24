// src/core/services/jwt.service.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET_ACCESS =
	process.env.ACCESS_TOKEN_SECRET || 'fallback-access_secret-key'
const JWT_SECRET_REFRESH =
	process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh_secret-key'

interface JwtPayload {
	userId: string
	sessionId?: string
}

export const jwtService = {
	signAccessToken(userId: string): string {
		return jwt.sign({ userId }, JWT_SECRET_ACCESS, { expiresIn: '15m' })
	},

	signRefreshToken(userId: string, sessionId: string): string {
		return jwt.sign({ userId, sessionId }, JWT_SECRET_REFRESH, {
			expiresIn: '7d',
		})
	},

	verifyAccessToken(token: string): { userId: string } {
		try {
			const payload = jwt.verify(token, JWT_SECRET_ACCESS) as JwtPayload
			return { userId: payload.userId }
		} catch {
			throw new Error('Invalid access token')
		}
	},

	verifyRefreshToken(token: string): { userId: string; sessionId: string } {
		try {
			const payload = jwt.verify(token, JWT_SECRET_REFRESH) as JwtPayload
			if (!payload.sessionId) throw new Error()
			return { userId: payload.userId, sessionId: payload.sessionId }
		} catch {
			throw new Error('Invalid refresh token')
		}
	},
}
