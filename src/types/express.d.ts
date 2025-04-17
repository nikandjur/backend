// types/express.d.ts

import { AuthJwtPayload } from '../types/jwt'

declare global {
	namespace Express {
		interface Request {
			user?: AuthJwtPayload
		}
	}
}
