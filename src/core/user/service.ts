// src/core/user/user.service.ts
import { prisma } from '../../db.js'
import {
	generateVerificationToken,
	verifyEmailToken,
} from '../auth/email-verification.js'
import { emailQueue } from '../auth/email.queue.js'
import { logger } from '../services/logger.js'
import { comparePassword, hashPassword } from '../services/password.js'
import { UserProfile } from './types.js'

export const userService = {
	// Регистрация
	async register(email: string, password: string, name: string) {
		// 1. Проверка пользователя и роли в одной транзакции
		const [existingUser, userRole] = await prisma.$transaction([
			prisma.user.findUnique({ where: { email } }),
			prisma.role.findUnique({ where: { name: 'USER' } }),
		])
		if (existingUser) throw new Error('USER_ALREADY_EXISTS')
		if (!userRole) throw new Error('DEFAULT_ROLE_NOT_FOUND')

		const hashedPassword = await hashPassword(password)

		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
				emailVerified: null,
				role: { connect: { id: userRole.id } },
			},
		})

		const token = await generateVerificationToken(user.id)

		emailQueue
			.add('verification', {
				type: 'verification',
				email: user.email,
				token,
			})
			.catch(() => logger.error('Queue add failed'))
		return user
	},

	async login(email: string, password: string) {
		const user = await this.validateCredentials(email, password)
		if (!user.emailVerified) throw new Error('Email not verified')

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				emailVerified: user.emailVerified,
			},
		}
	},

	async validateCredentials(email: string, password: string) {
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				name: true,
				email: true,
				password: true,
				emailVerified: true,
			},
		})

		if (!user || !(await comparePassword(password, user.password))) {
			throw new Error('Invalid credentials')
		}

		return user
	},

	// Подтверждение email
	async verifyEmail(token: string) {
		const userId = await verifyEmailToken(token)

		const user = await prisma.user.update({
			where: { id: userId },
			data: { emailVerified: new Date() },
			select: { id: true, email: true },
		})

		return { user }
	},

	// Повторная отправка подтверждения
	async resendVerification(userId: string, email: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { emailVerified: true },
		})

		if (user?.emailVerified) throw new Error('Email already verified')
		const token = await generateVerificationToken(userId)
		// Добавляем в очередь вместо прямой отправки
		await emailQueue.add(
			'verification',
			{
				type: 'verification',
				email,
				token,
			},
			{
				jobId: `resend-${userId}`, // Уникальный ID для предотвращения дублей
				attempts: 3,
				backoff: { type: 'exponential', delay: 1000 },
			}
		)
	},

	async getUserProfile(userId: string): Promise<UserProfile> {
		return prisma.user.findUniqueOrThrow({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				avatarUrl: true,
				bio: true,
				website: true,
				emailVerified: true,
				_count: { select: { posts: true } },
			},
		})
	},
	// Общая функция обновления 
	async updateUser(
		userId: string,
		data: { avatarUrl: string } | { bio: string } | { website: string } // Объединяем все возможные обновления
	): Promise<UserProfile> {
		return prisma.user.update({
			where: { id: userId },
			data,
			select: {
				id: true,
				email: true,
				name: true,
				avatarUrl: true,
				bio: true,
				website: true,
				emailVerified: true,
			},
		})
	},

	async getUserPosts(userId: string, page: number = 1, limit: number = 10) {
		return prisma.post.findMany({
			where: { authorId: userId },
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				title: true,
				content: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	},
}
