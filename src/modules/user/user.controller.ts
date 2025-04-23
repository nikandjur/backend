import { prisma } from '../../db.js'
import { generatePresignedUrl, getFileUrl } from '../storage/storage.service.js'
import { z } from 'zod'

const UploadSchema = z.object({
	userId: z.string().cuid(),
	objectName: z.string().min(1),
})

export const generateAvatarUploadUrl = async (userId: string) => {
	const validation = z.string().cuid().safeParse(userId)
	if (!validation.success) {
		throw new Error('Invalid user ID')
	}

	const objectName = `avatars/${userId}-${Date.now()}`
	const uploadUrl = await generatePresignedUrl(objectName)

	return {
		uploadUrl,
		objectName,
		method: 'PUT',
		expiresIn: '1 hour',
	}
}

export const confirmAvatarUpload = async (
	userId: string,
	objectName: string
) => {
	const validation = UploadSchema.safeParse({ userId, objectName })
	if (!validation.success) {
		throw new Error('Invalid input data')
	}

	const avatarUrl = getFileUrl(validation.data.objectName)

	return await prisma.user.update({
		where: { id: validation.data.userId },
		data: { avatarUrl },
		select: {
			id: true,
			email: true,
			name: true,
			avatarUrl: true,
		},
	})
}
