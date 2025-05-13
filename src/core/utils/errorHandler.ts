// src/middleware/errorHandler.ts
import { AppError } from '../types/error'
import { logger } from '../services/logger'
import { Request, Response, NextFunction } from 'express'

export const handleError = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const error = err as AppError

	// ✅ ВСЕГДА логируем ошибку
	logger.error(
		{
			event: 'api_error',
			type: error.code || 'unknown',
			status: error.statusCode,
			route: req.path,
			method: req.method,
			userId: req.user?.id || 'anonymous',
			ip: req.ip,
			expose: error.expose ?? true,
			isOperational: error.isOperational ?? true,
			error: {
				message: error.message,
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
				details: error.details,
			},
		},
		`[${error.code}] ${error.message}`
	)

	// 📤 Отправляем клиенту безопасный ответ
	const clientError = error.expose ? error.message : 'Internal Server Error'
	const clientCode = error.expose && error.code ? error.code : undefined

	res.status(error.statusCode).json({
		error: clientError,
		code: clientCode,
		details: error.expose ? error.details : undefined,
	})

	// 🔁 Передаем дальше только неоперационные ошибки
	if (!error.isOperational) {
		next(error)
	}
}
