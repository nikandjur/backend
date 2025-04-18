// types/express.d.ts

import { AuthJwtPayload } from 'custom-types/jwt'

declare global {
	namespace Express {
		interface Request {
			user?: AuthJwtPayload
		}
	}
}
