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

	// Аутентификация
	invalidToken: (message = 'Invalid token') =>
		createError(401, message, { code: 'INVALID_TOKEN' }),

	expiredToken: (message = 'Token expired') =>
		createError(401, message, { code: 'EXPIRED_TOKEN' }),

	revokedSession: (message = 'Session revoked') =>
		createError(401, message, { code: 'REVOKED_SESSION' }),

	// Защита от кражи
	ipMismatch: (message = 'IP address changed') =>
		createError(401, message, { code: 'IP_MISMATCH' }),

	deviceMismatch: (message = 'Device mismatch') =>
		createError(401, message, { code: 'DEVICE_MISMATCH' }),

	// Refresh Token
	refreshTokenRequired: (message = 'Refresh token required') =>
		createError(400, message, { code: 'REFRESH_TOKEN_REQUIRED' }),

	refreshTokenExpired: (message = 'Refresh token expired') =>
		createError(401, message, { code: 'REFRESH_TOKEN_EXPIRED' }),
}