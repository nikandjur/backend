import { completeEmailVerification } from '../../core/auth/email-verification.js'
import { comparePassword, hashPassword } from '../../core/auth/password.js'
import { createSession, deleteSession } from '../../core/auth/session.js'
import { sendVerificationEmail } from '../../core/services/email.js'
import { prisma } from '../../db.js'

export const verifyEmailAuth = completeEmailVerification

export const registerUser = async (
	email: string,
	password: string,
	name: string
) => {
	// Проверяем существование пользователя
	const existingUser = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	})

	if (existingUser) {
		throw new Error('USER_ALREADY_EXISTS')
	}

	const user = await prisma.user.create({
		data: {
			email,
			password: await hashPassword(password),
			name,
			emailVerified: null,
		},
	})

	await sendVerificationEmail(user.id, user.email)
	return user
}

export const loginUser = async (email: string, password: string) => {
	const user = await prisma.user.findUnique({ where: { email } })
	if (!user || !(await comparePassword(password, user.password))) {
		throw new Error('Invalid credentials')
	}
	const sessionId = await createSession(user.id)
	return { user, sessionId } // Возвращаем sessionId для контроллера
}

export const logoutUser = async (sessionId: string) => {
	await deleteSession(sessionId)
}
