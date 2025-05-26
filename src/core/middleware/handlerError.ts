import { logger } from '../services/logger.js'
import { AppError } from '../types/error.js'
import { Request, Response, NextFunction } from 'express'

export const handleError = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const error = err instanceof Error ? err : new Error(String(err))
	const appError = error as unknown as AppError

	const statusCode = appError.statusCode || 500
	const code = appError.code || `HTTP_${statusCode}`
	const detail = appError.details

	// Логируем только необходимое
	logger[statusCode >= 500 ? 'error' : 'warn']({
		code,
		status: statusCode,
		path: req.path,
		msg: error.message,
		...(detail && { detail }),
		...(statusCode >= 500 && { stack: error.stack }),
	})

	res.status(statusCode).json({
		error: error.message,
		...(statusCode < 500 && { code }),
		...(statusCode < 500 && detail && { detail }),
	})
}
