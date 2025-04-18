import { PrismaClient } from '@prisma/client'
import { comparePassword, hashPassword, signTokens } from './auth.utils.js'

const prisma = new PrismaClient()

export class AuthService {
	// Регистрация нового пользователя
	async register(email: string, password: string, name: string) {
		const existing = await prisma.user.findUnique({ where: { email } })
		if (existing) throw new Error('User already exists')

		const hashed = await hashPassword(password)

		const user = await prisma.user.create({
			data: { email, password: hashed, name },
		})

		const tokens = signTokens(user.id)

		return { user, tokens }
	}

	// Вход в систему
	async login(email: string, password: string) {
		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) throw new Error('User not found')

		const valid = await comparePassword(password, user.password)
		if (!valid) throw new Error('Invalid credentials')

		const tokens = signTokens(user.id)

		return { user, tokens }
	}
}
