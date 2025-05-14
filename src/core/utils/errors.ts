export const createError = (
	statusCode: number,
	message: string,
	options?: {
		code?: string
		details?: unknown
	}
) => {
	const error = new Error(message) as any
	error.statusCode = statusCode
	error.code = options?.code || `HTTP_${statusCode}`
	error.details = options?.details
	return error
}

export const ERRORS = {
	badRequest: (message = 'Bad request', details?: unknown) =>
		createError(400, message, { code: 'BAD_REQUEST', details }),
	unauthorized: (message = 'Unauthorized') =>
		createError(401, message, { code: 'UNAUTHORIZED' }),
	forbidden: (message = 'Forbidden') =>
		createError(403, message, { code: 'FORBIDDEN' }),
	notFound: (message = 'Not found') =>
		createError(404, message, { code: 'NOT_FOUND' }),
	internal: (message = 'Internal error') =>
		createError(500, message, { code: 'INTERNAL_ERROR' }),
}