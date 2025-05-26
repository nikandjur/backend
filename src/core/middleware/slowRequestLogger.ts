import { Request, Response, NextFunction } from 'express'
import { logger } from '../services/logger.js'

export const slowRequestLogger = (thresholdMs = 300) => {
	return (req: Request, res: Response, next: NextFunction) => {

		if (req.url === '/metrics') return next()
		const start = Date.now()

		res.on('finish', () => {
			const duration = Date.now() - start
			if (duration > thresholdMs) {
				logger.warn({
					level: 'warn',
					route: req.route?.path || req.path,
					method: req.method,
					duration,
					query: req.query,
					body: req.body,
					msg: `[SLOW REQUEST] Took ${duration}ms`,
				})
			}
		})

		next()
	}
}
