import { z } from 'zod'

const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')

export const registerSchema = z.object({
	email: z.string().email('Invalid email'),
	password: passwordSchema,
	name: z.string().min(2, 'Name too short'),
})

export const loginSchema = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(1, 'Password required'),
})

export const emailVerificationSchema = z.object({
	token: z.string().min(10, 'Invalid token format'),
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>
