import { z } from 'zod'

const cleanString = (val: string) => val.trim().replace(/[<>{}[\]\\]/g, '')

export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.transform(cleanString)

export const registerSchema = z.object({
	email: z.string().email('Invalid email').transform(cleanString),
	password: passwordSchema,
	name: z
		.string()
		.min(2, 'Name too short')
		.max(50, 'Name too long')
		.transform(cleanString),
})

export const loginSchema = z.object({
	email: z
		.string()
		.email('Invalid email')
		.transform(val => val.trim().toLowerCase()),
	password: z
		.string()
		.min(8, 'Password too short')
		.max(100, 'Password too long')
		.transform(val => val.trim()),
})

export const emailVerificationSchema = z.object({
	token: z.string().min(10, 'Invalid token format').transform(cleanString),
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>
