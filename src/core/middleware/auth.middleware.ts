// src/core/middleware/auth.middleware.ts
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { jwtService } from '../services/jwt.service.js'
import { logger } from '../services/logger.js'
import { ERRORS } from '../utils/errors.js'

export const authenticate = (req:Request, res:Response, next:NextFunction) => {
	
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) {
		 res.status(401).json(ERRORS.unauthorized())
		 return
	}

	const accessToken = authHeader.split(' ')[1]
	try {
		const payload = jwtService.verifyAccessToken(accessToken)

		req.user = { id: payload.userId }
		return next()
	} catch (error) {
		logger.error('Authentication failed', { error })
	 next(error)
	}
}

