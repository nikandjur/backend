type AppError = Error & { status: number; details?: any }

export const createError = (
	status: number,
	message: string,
	details?: any
): AppError => {
	const error = new Error(message) as AppError
	error.status = status
	return error
}

export const ERRORS = {
	badRequest: (msg = 'Bad request') => createError(400, msg),
	unauthorized: (msg = 'Unauthorized') => createError(401, msg),
	notFound: (msg = 'Not found') => createError(404, msg),
	internal: (msg = 'Internal error') => createError(500, msg),
}
