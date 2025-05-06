// src/core/types/express.d.ts
import { User, Role } from '@prisma/client'

declare global {
	namespace Express {
		interface Request {
			user?: Pick<User, 'id' | 'email' | 'name' | 'role'> | null
			cookies: Record<string, string>
			session?: {
				id: string
				ip?: string
			}
		}
	}
}
