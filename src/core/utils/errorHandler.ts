import {logger} from '../services/logger'
import { AppError } from '../types/error'
import { Request, Response, NextFunction } from 'express'

export const handleError = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const error = err instanceof Error ? err : new Error(String(err))
	const statusCode = 'statusCode' in error ? (error as any).statusCode : 500
	const code = 'code' in error ? (error as any).code : 'INTERNAL_ERROR'
	const details = 'details' in error ? (error as any).details : undefined

	const logMessage = {
		status: statusCode,
		code,
		route: req.path,
		method: req.method,
		...(details && { details }),
		error: {
			message: error.message,
			...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
		},
	}

	if (statusCode >= 500) {
		logger.error(logMessage, `[${code}] ${error.message}`)
	} else {
		logger.warn(logMessage, `[${code}] ${error.message}`)
	}
console.log('statusCode', error)
	res.status(statusCode).json({
		error: statusCode < 500 ? error.message : 'Internal Server Error',
		...(statusCode < 500 && { code }),
		...(details && statusCode < 500 && { details }),
	})

	if (statusCode >= 500) next(error)
}