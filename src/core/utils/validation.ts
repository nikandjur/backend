import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { logger } from '../services/logger'

export const validate =
	(schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const result = await schema.safeParseAsync(req[source])

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

			req[source] = result.data
			next()
		} catch (err) {
			next(err)
		}
	}
