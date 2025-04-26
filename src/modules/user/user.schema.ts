import { z } from 'zod'

export const emailVerificationSchema = z.object({
	token: z.string().min(10, 'Invalid token format'),
})

export const avatarConfirmSchema = z.object({
	objectName: z
		.string()
		.min(1, 'Object name is required')
		.startsWith('avatars/', "Must start with 'avatars/'"),
})

export const UploadSchema = z.object({
	userId: z.string().cuid(),
	objectName: z.string().min(1),
})
