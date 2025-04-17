import { JwtUtils } from 'utils/jwt.utils'
import { comparePassword, hashPassword } from 'utils/password.utils'


export const signTokens = (userId: string) => {
	return {
		accessToken: JwtUtils.signAccessToken(userId),
		refreshToken: JwtUtils.signRefreshToken(userId),
	}
}

export { comparePassword, hashPassword }
