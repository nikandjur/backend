// src/core/types/express.d.ts
import { User } from '@prisma/client'

declare global {
	namespace Express {
		interface User {
			id: string
			email?: string
			name?: string
			avatarUrl?: string | null
			bio?: string | null
			website?: string | null
			emailVerified?: Date | null
			role?: string
		}

		interface Request {
			user: User // Теперь user обязательный после authenticate
			cookies: Record<string, string>
			validatedQuery?: Record<string, unknown>
			correlationId?: string
			sessionId: string
		}

	}
}
