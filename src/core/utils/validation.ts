import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { logger } from '../services/logger'

export const validate =
	(schema: AnyZodObject) =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			// console.log('Raw body:', req.body) // Добавляем лог сырых данных
			// Явно проверяем body, а не всю структуру
			const result = await schema.safeParseAsync(req.body)

			if (!result.success) {
				logger.warn('Validation errors:', result.error.errors)
				 res.status(400).json({
					error: 'Validation failed',
					issues: result.error.errors.map(e => ({
						field: e.path.join('.'),
						message: e.message,
					})),
				})
				return
			}

			// Присваиваем провалидированные данные
			req.body = result.data
			next()
		} catch (err) {
			next(err)
		}
	}