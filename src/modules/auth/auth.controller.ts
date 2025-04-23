import { Request, Response } from 'express'
import { getErrorMessage } from '../../utils/error.js'
import {
	createUserSession,
	loginUser,
	logoutUser,
	registerUser,
	validateSession,
} from './auth.service.js'

export const register = async (req: Request, res: Response) => {
	try {
		const user = await registerUser(
			req.body.email,
			req.body.password,
			req.body.name
		)
		const sessionId = await createUserSession(user.id)

		res.cookie('sessionId', sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		res.status(201).json({ user })
	} catch (error) {
		res.status(400).json({ error: getErrorMessage(error) })
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const user = await loginUser(req.body.email, req.body.password)
		const sessionId = await createUserSession(user.id)

		res.cookie('sessionId', sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		res.status(200).json({ user })
	} catch (error) {
		res.status(400).json({ error: getErrorMessage(error) })
	}
}

export const logout = async (req: Request, res: Response) => {
	try {
		await logoutUser(req.cookies.sessionId)
		res.clearCookie('sessionId')
		res.status(200).json({ message: 'Logged out' })
	} catch (error) {
		res.status(400).json({ error: getErrorMessage(error) })
	}
}

export const getCurrentUser = async (req: Request, res: Response) => {
	try {
		const user = await validateSession(req.cookies.sessionId)
		res.status(200).json({ user })
	} catch (error) {
		res.status(400).json({ error: getErrorMessage(error) })
	}
}
