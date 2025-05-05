// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express'
import { sessionService } from '../../core/auth/session.js'
import { userService } from '../../core/user/service.js'
import { handleError } from '../../core/utils/errorHandler.js'

export const register = async (req: Request, res: Response) => {
	try {
		const user = await userService.register(
			req.body.email,
			req.body.password,
			req.body.name
		)
		res.status(201).json({ user })
	} catch (error) {
		handleError(res, error)
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const { user, sessionId } = await userService.login(
			req.body.email,
			req.body.password
		)

		res
			.cookie('sessionId', sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 604800000,
				sameSite: 'lax',
			})
			.json({ user })
	} catch (error) {
		res.status(401).json({ error: 'Invalid credentials' })
		handleError(res, error)
	}
}

export const logout = async (req: Request, res: Response) => {
	try {
		await sessionService.delete(req.cookies.sessionId)
		res.clearCookie('sessionId').json({ message: 'Logged out' })
	} catch (error) {
		handleError(res, error)
	}
}

export const getCurrentUser = (req: Request, res: Response) => {
	res.json({ user: req.user })
}

export const verifyEmailHandler = async (req: Request, res: Response) => {
	try {
		const { token } = req.query
		if (!token || typeof token !== 'string') {
			res.status(400).json({ error: 'Token is required' })
			return
		}

		const { user, sessionId } = await userService.verifyEmail(token)

		res
			.cookie('sessionId', sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 604800000,
				sameSite: 'lax',
			})
			.json({ user })
	} catch (error) {
		res.status(400).json({ error: 'Invalid or expired token' })
	}
}

export const resendVerificationHandler = async (
	req: Request,
	res: Response
) => {
	try {
		if (!req.user) {
			res.status(401).json({ error: 'Authentication required' })
			return
		}

		await userService.resendVerification(req.user.id, req.user.email)
		res.json({ message: 'Verification email sent' })
	} catch (error) {
		handleError(res, error)
	}
}
