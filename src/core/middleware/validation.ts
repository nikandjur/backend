import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodIssue } from 'zod'
import { ERRORS } from '../utils/errors.js'

// Вспомогательный тип для деталей ошибки
type ValidationErrorDetail = {
	field: string
	code: string
	message: string
	source: 'body' | 'query' | 'params'
	received?: unknown
	expected?: unknown
}

export const validate = (
	schema: AnyZodObject,
	source: 'body' | 'query' | 'params' = 'query'
) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
    console.log('req.body',req.body)
		try {
			const result = await schema.safeParseAsync(req[source])
 console.log('result', result)
			if (!result.success) {
				const firstIssue = result.error.issues[0]
				const errorDetail: ValidationErrorDetail = {
					field: firstIssue.path.join('.'),
					code: firstIssue.code,
					message: firstIssue.message,
					source,
					...('received' in firstIssue && { received: firstIssue.received }),
					...('expected' in firstIssue && { expected: firstIssue.expected }),
				}

				throw ERRORS.badRequest('Invalid request data', errorDetail)
			}

			req[source === 'query' ? 'validatedQuery' : source] = result.data
			next()
		} catch (err) {
			next(err)
		}
	}
}
