import { logger } from '../services/logger'
import { AppError } from '../types/error'
import { Request, Response, NextFunction } from 'express'

export const handleError = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const error = err instanceof Error ? err : new Error(String(err))

	const statusCode =
		'statusCode' in error ? (error as AppError).statusCode : 500
	const code = 'code' in error ? (error as AppError).code : `HTTP_${statusCode}`
	const detail = 'detail' in error ? (error as AppError).detail : undefined

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
