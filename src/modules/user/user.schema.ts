import { z } from 'zod'

// Параметры пути
export const userIdParamsSchema = z.object({
	userId: z.string().cuid(),
})

// Query параметры
export const userIdQuerySchema = z
	.object({
		userId: z.string().cuid(),
	})
	.optional()

// Тело запроса
export const profileUpdateSchema = z.object({
	name: z.string().min(2).max(50).optional(),
	bio: z.string().max(500).optional(),
	website: z.string().url().optional(),
})

export const paginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
})
