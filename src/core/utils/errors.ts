import { AppError } from '../types/error'

type ErrorOptions = Pick<
	AppError,
	'code' | 'details' | 'isOperational' | 'expose'
>

export const createError = (
	statusCode: number,
	message: string,
	options?: ErrorOptions
): AppError => {
	const error = new Error(message) as AppError
	error.statusCode = statusCode
	error.code = options?.code || 'INTERNAL_ERROR'
	error.isOperational = options?.isOperational ?? true
	error.expose = options?.expose ?? statusCode < 500

	if (options?.details) {
		error.details = options.details
	}

	return error
}

export const ERRORS = {
	badRequest: (message = 'Bad request', details?: Record<string, unknown>) =>
		createError(400, message, { code: 'BAD_REQUEST', details }),
	unauthorized: (message = 'Unauthorized') =>
		createError(401, message, { code: 'UNAUTHORIZED' }),
	forbidden: (message = 'Forbidden') =>
		createError(403, message, { code: 'FORBIDDEN' }),
	notFound: (message = 'Not found') =>
		createError(404, message, { code: 'NOT_FOUND' }),
	conflict: (message = 'Conflict') =>
		createError(409, message, { code: 'CONFLICT' }),
	internal: (message = 'Internal error') =>
		createError(500, message, { code: 'INTERNAL_ERROR', isOperational: false }),
}
