import { NextFunction, Request, Response } from 'express'
import { logger } from '../../core/services/logger.js'
import { userService } from '../../core/user/service.js'
import { ERRORS } from '../../core/utils/errors.js'
import {
	emailVerificationSchema,
	loginSchema,
	registerSchema,
} from './auth.schema.js'
import { jwtService } from '../../core/services/jwt.service.js'
import { sessionService } from '../../core/services/session.service.js'
import { error } from 'console'

// для прода
// const setAuthCookie = (res: Response, sessionId: string) => {
// 	res.cookie('sessionId', sessionId, {
// 		httpOnly: true,
// 		secure: process.env.NODE_ENV === 'production',
// 		maxAge: 604800000, // 7 days
// 		sameSite: 'lax',
// 	})
// }
const setAuthCookie = (res: Response, refreshToken: string) => {
	res.cookie('refresh_token', refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'none',
		maxAge: 604800000, // 7 дней
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
		logger.debug(`Login attempt for ${validatedData.email}`)

		const { user } = await userService.login(
			validatedData.email,
			validatedData.password
		)
		const { sessionId } = await sessionService.create(user.id)

		const accessToken = jwtService.signAccessToken(user.id)
		const refreshToken = jwtService.signRefreshToken(user.id, sessionId)

		setAuthCookie(res, refreshToken)

		res.json({
			access_token: accessToken,
			refresh_token: refreshToken,
			user
		})
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
		const refreshToken = req.cookies.refresh_token
		if (!refreshToken) { 
			res.json({ success: true })
			return
		}
		const payload = jwtService.verifyRefreshToken(refreshToken)
		await sessionService.invalidateSession(payload.sessionId)

		res.clearCookie('refresh_token')
		 res.json({ success: true })
		 return
		
	} catch (err) {
		 next(err)
	}
}

export const refresh = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const refreshToken = req.cookies.refresh_token
		if (!refreshToken) {
			res.status(400).json(ERRORS.refreshTokenRequired())
			return 
		}

		const payload = jwtService.verifyRefreshToken(refreshToken)
		const isValid = await sessionService.validateSession(
			payload.sessionId,
			payload.userId
		)
		await sessionService.invalidateSession(payload.sessionId)

		if (!isValid) {
			res.status(401).json(ERRORS.revokedSession())
			return
		} 
		const { sessionId } = await sessionService.create(payload.userId)

		const newAccessToken = jwtService.signAccessToken(payload.userId)
		const newRefreshToken = jwtService.signRefreshToken(
			payload.userId,
			sessionId
		)

		setAuthCookie(res, newRefreshToken)
		
		res.json({ access_token: newAccessToken, refresh_token: newRefreshToken })
	} catch (err) {
		logger.error('Refresh token failed', { error: err })
		res.status(401).json(ERRORS.refreshTokenExpired())
		next(error)
	}
}


export const getCurrentUser = async (req: Request, res: Response) => {
	const userId = req.user.id

	// Запрашиваем полный профиль из БД
	const user = await userService.getUserProfile(userId)

	if (!user) {
		 res.status(404).json({ error: 'User not found' })
		 return
	}

	res.json({ user })
}

export const verifyEmailHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { token } = emailVerificationSchema.parse(req.query)
		// console.log('token',token,'req',req.query)
		const { user} = await userService.verifyEmail(token)


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
		if (!req.user.email) {
			throw ERRORS.badRequest('Email is required for resending verification')
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
