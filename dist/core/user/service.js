// src/core/user/user.service.ts
import { prisma } from '../../db.js';
import { generateVerificationToken, verifyEmailToken, } from '../auth/email-verification.js';
import { comparePassword, hashPassword } from '../auth/password.js';
import { sessionService } from '../auth/session.js';
import { sendVerificationEmail } from '../services/email.js';
export const userService = {
    // Регистрация
    async register(email, password, name) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser)
            throw new Error('USER_ALREADY_EXISTS');
        // Находим роль USER (она должна быть создана в initRoles)
        const userRole = await prisma.role.findUnique({
            where: { name: 'USER' },
            select: { id: true },
        });
        if (!userRole)
            throw new Error('DEFAULT_ROLE_NOT_FOUND');
        const user = await prisma.user.create({
            data: {
                email,
                password: await hashPassword(password),
                name,
                emailVerified: null,
                role: { connect: { id: userRole.id } }, // Связываем с ролью
            },
        });
        const token = await generateVerificationToken(user.id);
        await sendVerificationEmail(user.email, token);
        return user;
    },
    // Аутентификация
    async login(email, password, ip) {
        // Добавляем параметр ip
        const user = await this.validateCredentials(email, password);
        if (!user.emailVerified)
            throw new Error('Email not verified');
        const userWithRole = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true },
        });
        if (!userWithRole?.role)
            throw new Error('User role not found');
        const sessionId = await sessionService.create(user.id, userWithRole.role.name, ip // Используем переданный IP
        );
        return { user: { id: user.id }, sessionId };
    },
    // Валидация учётных данных
    async validateCredentials(email, password) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, password: true, emailVerified: true },
        });
        if (!user || !(await comparePassword(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        return user;
    },
    // Подтверждение email
    async verifyEmail(token, ip) {
        // Добавляем параметр ip
        const userId = await verifyEmailToken(token);
        const user = await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: new Date() },
            select: { id: true, email: true, role: true }, // Добавляем role в выборку
        });
        if (!user.role)
            throw new Error('User role not found');
        const sessionId = await sessionService.create(user.id, user.role.name, ip);
        return { user, sessionId };
    },
    // Повторная отправка подтверждения
    async resendVerification(userId, email) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { emailVerified: true },
        });
        if (user?.emailVerified)
            throw new Error('Email already verified');
        const token = await generateVerificationToken(userId);
        await sendVerificationEmail(email, token);
    },
    async getUserProfile(userId) {
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
        });
    },
    // Общая функция обновления с типизацией
    async updateUser(userId, data // Объединяем все возможные обновления
    ) {
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
        });
    },
    async getUserPosts(userId, page = 1, limit = 10) {
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
        });
    },
};
