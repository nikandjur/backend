import pino from 'pino'
import pinoHttp from 'pino-http'
import { Request } from 'express' // Добавляем импорт

export const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	transport:
		process.env.NODE_ENV === 'development'
			? { target: 'pino-pretty' }
			: undefined,
})

export const httpLogger = pinoHttp({
	logger,
	customProps: (req: Request) => ({
		// Явно указываем тип Request
		user: req.user?.id || 'anonymous',
		sessionId: req.cookies?.sessionId,
	}),
})
