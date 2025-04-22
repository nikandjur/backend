import { PrismaClient, User } from '@prisma/client'
import { randomUUID } from 'crypto'
import { RedisService } from '../../redis/redis.service'
import { comparePassword, hashPassword } from './auth.utils'

const prisma = new PrismaClient()

// Конфигурация сессий
const SESSION_CONFIG = {
	ttl: 60 * 60 * 24 * 7, // 7 дней
}

// Типы
type SessionData = { userId: string }
type AuthResult = { user: User }

// Основные функции
export const authService = {
	async register(
		email: string,
		password: string,
		name: string
	): Promise<AuthResult> {
		const existing = await prisma.user.findUnique({ where: { email } })
		if (existing) throw new Error('User already exists')

		const user = await prisma.user.create({
			data: {
				email,
				password: await hashPassword(password),
				name,
			},
		})

		return createSession(user.id)
	},

	async login(email: string, password: string): Promise<AuthResult> {
		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) throw new Error('User not found')

		const isValid = await comparePassword(password, user.password)
		if (!isValid) throw new Error('Invalid credentials')

		return createSession(user.id)
	},

	async logout(sessionId: string): Promise<void> {
		await RedisService.del(sessionId)
	},

	async validateSession(sessionId: string): Promise<User> {
		const session = await RedisService.getJSON<SessionData>(sessionId)
		if (!session || !session.userId)
			throw new Error('Invalid or expired session')

		const user = await prisma.user.findUniqueOrThrow({
			where: { id: session.userId },
		})
		return user
	},
}

// Вспомогательные функции
async function createSession(userId: string): Promise<AuthResult> {
	const sessionId = randomUUID()

	await RedisService.setJSON(sessionId, { userId }, SESSION_CONFIG.ttl)

	return {
		user: await prisma.user.findUniqueOrThrow({ where: { id: userId } }),
	}
}
