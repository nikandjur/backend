// src/modules/user/check.schema.ts
import { z } from 'zod'

export const checkEmailSchema = z.object({
	email: z.string().email('Invalid email address').trim(),
})
