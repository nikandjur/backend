import { Request, Response, NextFunction } from 'express'
import { logger } from '../services/logger'

export const handleError = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Логируем ВСЕ ошибки
	logger.error(err)

	// Определяем статус и сообщение
	const status = (err as any).status || 500
	const message =
		status >= 500 ? 'Something went wrong' : (err as Error).message || 'Error'

	// Формируем ответ
	res.status(status).json({
		error: message,
		...(status < 500 && { details: (err as any).details }), // 4xx ошибки показываем детали
	})
}
