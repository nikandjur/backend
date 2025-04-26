import { User } from '@prisma/client'

export type UserProfile = Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'> & {
	emailVerified?: Date | null // Приводим в соответствие с Prisma
}
