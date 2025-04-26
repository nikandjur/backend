import { prisma } from '../../db'
import { UserProfile } from './types'

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
	return prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			name: true,
			avatarUrl: true,
			emailVerified: true,
		},
	})
}
