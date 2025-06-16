// src/modules/user/check.controller.ts
import { Request, Response } from 'express'
import { prisma } from '../../db.js'
import { checkEmailSchema } from './check.schema.js'
import { logger } from '../../core/services/logger.js'
import  redis  from '../../core/services/redis/client.js'

export const checkEmailAvailability = async (
	req: Request,
	res: Response
): Promise<void> => {
	const result = checkEmailSchema.safeParse(req.query)

	if (!result.success) {
		res.status(400).json({ error: result.error.errors[0].message })
		return
	}

	const { email } = result.data

	const cached = await redis.get(`check:email:${email}`)
	if (cached !== null) {
		res.json({ available: cached === '0' })
		return
	}

	const existing = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	})

	await redis.set(`check:email:${email}`, existing ? '1' : '0', 'EX', 60)

	res.json({ available: !existing })
}
