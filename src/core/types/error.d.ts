// src/types/error.d.ts
interface AppError extends Error {
	statusCode: number
	code: string
	details?: unknown
	isOperational?: boolean
}
