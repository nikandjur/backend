import { Request, Response } from 'express'
import { registerUser, loginUser, logoutUser, verifyEmailAuth, } from './auth.service.js'
import { handleError } from '../../core/utils/errorHandler.js'

export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const user = await registerUser(
			req.body.email,
			req.body.password,
			req.body.name
		)
		res.status(201).json({ user })
	} catch (err) {
		if (err.message === 'USER_ALREADY_EXISTS') {
			handleError(res, 'Email already registered', 409)
		} else {
			handleError(res, err)
		}
	}
}

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { user, sessionId } = await loginUser(
			req.body.email,
			req.body.password
		)

		// Устанавливаем куку
		res.cookie('sessionId', sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
			sameSite: 'strict',
		})

		res.status(200).json({ user })
	} catch (err) {
		handleError(res, err)
	}
}

export const logout = async (req: Request, res: Response): Promise<void> => {
	try {
		await logoutUser(req.cookies.sessionId)
		res.clearCookie('sessionId')
		res.json({ message: 'Logged out' })
	} catch (err) {
		handleError(res, err)
	}
}

export const getCurrentUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	res.json({ user: req.user })
}

export const verifyEmailHandler = async (req: Request, res: Response) => {
	try {
		const user = await verifyEmailAuth(req.query.token as string)
		res.json({ user })
	} catch (err) {
		handleError(res, err)
	}
}
