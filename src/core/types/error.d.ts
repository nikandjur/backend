// src/types/error.d.ts
export interface AppError extends Error {
	statusCode: number
	code: string
	details?: Record<string, unknown> // Добавляем details для передачи дополнительных данных
	isOperational?: boolean
	expose?: boolean // Добавляем для контроля вывода ошибок
}