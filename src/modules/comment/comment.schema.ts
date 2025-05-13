import { z } from 'zod'

export const createCommentSchema = z.object({
	text: z.string().min(1).max(1000),
})

export const commentParamsSchema = z.object({
	postId: z.string().cuid(),
})

export const commentIdSchema = z.object({
	id: z.string().cuid(),
})
