import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export const JwtUtils = {
	signAccessToken: (userId: string): string => {
		return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' })
	},

	signRefreshToken: (userId: string): string => {
		return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' })
	},

	verifyAccessToken: (token: string) => {
		return jwt.verify(token, ACCESS_SECRET)
	},

	verifyRefreshToken: (token: string) => {
		return jwt.verify(token, REFRESH_SECRET)
	},

	decodeToken: (token: string) => {
		return jwt.decode(token)
	},
}
