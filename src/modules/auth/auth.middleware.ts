import { Request, Response, NextFunction } from 'express'
import { redisService } from '../../redis/redis.service.js'
import { prisma } from '../../db.js'

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const sessionId = req.cookies?.sessionId
	if (!sessionId) {
		res.status(401).json({ error: 'Session required' })
		return
	}

	try {
		const session = await redisService.getJSON<{ userId: string }>(
			`sessions:${sessionId}`
		)

		if (!session?.userId) {
			res.status(401).json({ error: 'Invalid session' })
			return
		}

		// Получаем полные данные пользователя из БД
		const user = await prisma.user.findUnique({
			where: { id: session.userId },
			select: { id: true, email: true, name: true },
		})

		if (!user) {
			res.status(401).json({ error: 'User not found' })
			return
		}

		req.user = user
		next()
	} catch (error) {
		console.error('Auth error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
