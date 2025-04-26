import { z } from 'zod'
import { completeEmailVerification } from '../../core/auth/email-verification.js'
import {
	generatePresignedUrl,
	getObjectUrl,
} from '../../core/services/storage/service.js'
import { UserProfile } from '../../core/user/types.js'
import { prisma } from '../../db.js'
import { UploadSchema } from './user.schema.js'

export const verifyEmailUser = completeEmailVerification

// Генерация URL для аватара
export const generateUserAvatarUploadUrl = async (userId: string) => {
	const objectName = `avatars/${userId}-${Date.now()}`
	return {
		uploadUrl: await generatePresignedUrl(objectName),
		objectName,
		accessUrl: getObjectUrl(objectName),
		expiresIn: '1h',
	}
}

// Подтверждение аватара
export const confirmUserAvatar = async (
	userId: string,
	objectName: string
): Promise<UserProfile> => {
	const { objectName: validatedName } = UploadSchema.parse({
		userId,
		objectName,
	})

	if (!validatedName.startsWith('avatars/')) {
		throw new Error("Object name must start with 'avatars/'")
	}

	return updateUser(userId, {
		avatarUrl: getObjectUrl(validatedName),
	})
}

// Общая функция обновления
const updateUser = async (userId: string, data: any): Promise<UserProfile> => {
	return prisma.user.update({
		where: { id: userId },
		data,
		select: {
			id: true,
			email: true,
			name: true,
			avatarUrl: true,
			emailVerified: true  // не включаем, если его нет в модели
		},
	})
}
