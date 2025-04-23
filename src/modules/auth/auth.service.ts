import { prisma } from '../../db.js'
import { redisService } from '../../redis/redis.service.js'
import { hashPassword, comparePassword } from './auth.utils'

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 дней

export const createUserSession = async (userId: string) => {
	const sessionId = crypto.randomUUID()
	await redisService.setJSON(`sessions:${sessionId}`, { userId }, SESSION_TTL)
	return sessionId
}

export const registerUser = async (
	email: string,
	password: string,
	name: string
) => {
	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) throw new Error('User already exists')

	const user = await prisma.user.create({
		data: {
			email,
			password: await hashPassword(password),
			name,
		},
	})

	return user
}

export const loginUser = async (email: string, password: string) => {
	const user = await prisma.user.findUnique({ where: { email } })
	if (!user) throw new Error('User not found')

	const isValid = await comparePassword(password, user.password)
	if (!isValid) throw new Error('Invalid credentials')

	return user
}

export const logoutUser = async (sessionId: string) => {
	await redisService.del(`sessions:${sessionId}`)
}

export const validateSession = async (sessionId: string) => {
	const session = await redisService.getJSON<{ userId: string }>(
		`sessions:${sessionId}`
	)
	if (!session?.userId) throw new Error('Invalid session')

	return prisma.user.findUniqueOrThrow({ where: { id: session.userId } })
}
