import { JwtUtils } from '../../utils/jwt.utils.js'
import { comparePassword, hashPassword } from '../../utils/password.utils.js'

export const signTokens = (userId: string) => {
	return {
		accessToken: JwtUtils.signAccessToken(userId),
		refreshToken: JwtUtils.signRefreshToken(userId),
	}
}

export { comparePassword, hashPassword }
