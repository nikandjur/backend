import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
			user?: Pick<User, 'id' | 'email' | 'name'> | null
			cookies: Record<string, string>
			session?: {
				id: string
				ip?: string
			}
		}
  }
}