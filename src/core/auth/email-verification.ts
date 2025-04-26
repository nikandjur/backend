import jwt from 'jsonwebtoken'
import { redisService } from '../services/redis/service'
import { prisma } from '../../db'
import { UserProfile } from '../user/types'

const VERIFICATION_TOKEN_TTL = 60 * 60 * 24 // 24 часа

export const generateVerificationToken = (userId: string): string => {
	if (!process.env.JWT_EMAIL_SECRET)
		throw new Error('JWT_EMAIL_SECRET не задан')
	return jwt.sign({ userId }, process.env.JWT_EMAIL_SECRET, { expiresIn: '1d' })
}

export const verifyEmailToken = async (token: string): Promise<string> => {
	const userId = await redisService.getSession(`email-verification:${token}`)
	if (!userId) throw new Error('Неверный или просроченный токен')

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { emailVerified: true },
	})

	if (user?.emailVerified) throw new Error('Email уже подтверждён')
	jwt.verify(token, process.env.JWT_EMAIL_SECRET!)
	await redisService.deleteSession(`email-verification:${token}`)
	return userId
}

export const completeEmailVerification = async (
	token: string
): Promise<UserProfile> => {
	const userId = await verifyEmailToken(token)
	return prisma.user.update({
		where: { id: userId },
		data: { emailVerified: new Date() },
		select: {
			id: true,
			email: true,
			name: true,
			avatarUrl: true,
			emailVerified: true,
		},
	})
}
