// src/modules/storage/storage.schema.ts
import { z } from 'zod'

export const avatarConfirmSchema = z.object({
	key: z
		.string()
		.min(1, 'Key is required')
		.regex(
			/^avatars\/[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp)$/i,
			'Invalid file format. Allowed: jpg, jpeg, png, webp'
		),
})
