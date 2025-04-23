import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { getErrorMessage } from '../utils/error.js'

export const validate =
	(schema: AnyZodObject) =>
	(req: Request, res: Response, next: NextFunction): void => {
		console.log('Received data:', req.body) // Логируем входящие данные для отладки
		try {
			// Проверяем только body для регистрации/логина
			schema.parse(req.body)
			next()
		} catch (err) {
			if (err instanceof ZodError) {
				 res.status(400).json({
					error: 'Validation failed',
					issues: err.errors.map(e => ({
						field: e.path.join('.'),
						message: e.message,
					})),
				})
				return
			}
			res.status(500).json({ error: getErrorMessage(err) })
		}
	}
