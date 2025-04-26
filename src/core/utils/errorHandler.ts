import { Response } from 'express'
import { logger } from '../services/logger'

export const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) return error.message
	if (typeof error === 'string') return error
	return 'Unknown error'
}

export const handleError = (res: Response, error: unknown, status = 400) => {
	const message = getErrorMessage(error)
	logger.error(error)
	res.status(status).json({ error: message })
}
