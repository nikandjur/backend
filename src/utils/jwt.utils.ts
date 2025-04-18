import jwt from 'jsonwebtoken'

export const JwtUtils = {
	signAccessToken: (userId: string): string => {
		const secret = process.env.JWT_SECRET
		if (!secret) throw new Error('JWT_SECRET is not defined')
		return jwt.sign({ sub: userId }, secret, { expiresIn: '15m' })
	},

	signRefreshToken: (userId: string): string => {
		const secret = process.env.JWT_REFRESH_SECRET
		if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined')
		return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' })
	},

	verifyAccessToken: (token: string) => {
		const secret = process.env.JWT_SECRET
		if (!secret) throw new Error('JWT_SECRET is not defined')
		return jwt.verify(token, secret)
	},

	verifyRefreshToken: (token: string) => {
		const secret = process.env.JWT_REFRESH_SECRET
		if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined')
		return jwt.verify(token, secret)
	},

	decodeToken: (token: string) => {
		return jwt.decode(token)
	},
}
