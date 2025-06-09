import { NextFunction, Request, Response } from 'express'
import { sessionService } from '../../core/auth/session.js'
import { logger } from '../../core/services/logger.js'
import { userService } from '../../core/user/service.js'
import { ERRORS } from '../../core/utils/errors.js'
import {
	emailVerificationSchema,
	loginSchema,
	registerSchema,
} from './auth.schema.js'

const setAuthCookie = (res: Response, sessionId: string) => {
	res.cookie('sessionId', sessionId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		maxAge: 604800000, // 7 days
		sameSite: 'lax',
	})
}

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const validatedData = registerSchema.parse(req.body)
		const user = await userService.register(
			validatedData.email,
			validatedData.password,
			validatedData.name
		)
		res.status(201).json({ user })
	} catch (err) {
		next(err)
	}
}

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const validatedData = loginSchema.parse(req.body)
		logger.debug(`Login attempt for ${validatedData}`) 
		const { user, sessionId } = await userService.login(
			validatedData.email,
			validatedData.password,
			req.ip
		)

		setAuthCookie(res, sessionId)
		res.json({ user })
	} catch (err) {
		next(err)
	}
}

export const logout = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await sessionService.delete(req.cookies.sessionId)
		res.clearCookie('sessionId').sendStatus(204)
	} catch (err) {
		next(err)
	}
}

export const getCurrentUser = (req: Request, res: Response) => {
	res.json({ user: req.user })
}

export const verifyEmailHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { token } = emailVerificationSchema.parse(req.query)
		// console.log('token',token,'req',req.query)
		const { user, sessionId } = await userService.verifyEmail(token, req.ip)

		setAuthCookie(res, sessionId)
		res.json({ user })
	} catch (err) {
		next(err)
	}
}

export const resendVerificationHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			throw ERRORS.unauthorized('Authentication required')
		}

		await userService.resendVerification(req.user.id, req.user.email)
		logger.info(`Resent verification to ${req.user.email}`, {
			userId: req.user.id,
			action: 'resend_verification',
		})
		res.json({ message: 'Verification email sent' })
	} catch (err) {
		next(err)
	}
}
