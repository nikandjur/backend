// src/core/types/express.d.ts
import { User } from '@prisma/client'

declare global {
	namespace Express {
		interface User {
			id: string
			email: string
			name: string | null
			role: string
		}

		interface Request {
			user: User // Теперь user обязательный после authenticate
			cookies: Record<string, string>
			validatedQuery?: Record<string, unknown>
			correlationId?: string
		}

	}
}
