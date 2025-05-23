// src/core/middleware/metrics.middleware.ts
import { NextFunction, Request, Response } from 'express'
import { metrics } from './metrics'


export const metricsMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// ❌ Исключаем /metrics из обработки
	if (req.url === '/metrics') {
		return next()
	}

	const start = Date.now()
	const route = req.route?.path || req.path

	res.on('finish', () => {
		// 🚫 Не собираем метрики в development
		if (process.env.NODE_ENV !== 'development') {
			metrics.httpRequestsTotal.inc({
				method: req.method,
				route,
				status: res.statusCode,
			})

			metrics.httpRequestDuration.observe(
				{
					method: req.method,
					route,
				},
				(Date.now() - start) / 1000 // в секундах
			)
		}
	})

	next()
}
