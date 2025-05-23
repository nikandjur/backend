import { logger } from '../services/logger'
import { NextFunction, Request, Response } from 'express'

// В httpLogger middleware:
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
	if (req.url === '/metrics') return next()
	const start = Date.now()
	const headerValue = req.headers['x-correlation-id']
	const correlationId = Array.isArray(headerValue)
		? headerValue[0]
		: headerValue || crypto.randomUUID()

	// Добавляем ID в запрос для использования в других middleware
	req.correlationId = correlationId

	res.on('finish', () => {
		const duration = Date.now() - start
		const logData = {
			correlationId,
			method: req.method,
			url: req.url,
			status: res.statusCode,
			responseTime: duration,
			// Добавляем user ID если есть
			userId: req.user?.id,
		}

		logger.info(
			logData,
			`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`
		)
	})

	next()
}
