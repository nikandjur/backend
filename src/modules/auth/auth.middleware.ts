import { Request, Response, NextFunction } from 'express'
import { redisService } from '../../redis/redis.service.js'

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

		req.user = { id: session.userId, email: '' }
		next()
	} catch (error) {
		console.error('Auth error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
