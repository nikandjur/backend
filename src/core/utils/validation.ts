import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'
import { ERRORS } from './errors'

// src/core/utils/validation.ts
export const validate = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'query'
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req[source])
      if (!result.success) {
        // const issues = result.error.issues.map(i => ({
        //   path: i.path.join('.'),
        //   message: i.message,
        //   code: i.code
        // }))
        // throw ERRORS.badRequest(result.error.errors[0]?.message || 'Invalid data')
        throw ERRORS.badRequest('Validation error', {
					error: result.error.issues[0], source
				})
      }

      req[source === 'query' ? 'validatedQuery' : source] = result.data
      next()
    } catch (err) {
      next(err)
    }
  }
}