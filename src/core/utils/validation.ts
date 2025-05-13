import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'
import { ERRORS } from './errors'

export const validate = (
	schema: AnyZodObject,
	source: 'body' | 'query' | 'params' = 'query'
) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const result = await schema.safeParseAsync(req[source])
			console.log('result', result.error?.errors)
			if (!result.success) {
				throw ERRORS.badRequest('Invalid data', {
					message: result.error
				
				
				})
			}

			req[source === 'query' ? 'validatedQuery' : source] = result.data
			next()
		} catch (err) {
			next(err)
		}
	}
}
