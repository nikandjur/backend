import { Request, Response } from 'express'
import { authService } from './auth.service'

// Регистрация пользователя
export const register = async (req: Request, res: Response) => {
	const { email, password, name } = req.body
	try {
		// Регистрация пользователя и создание сессии
		const { user } = await authService.register(email, password, name)

		// Генерация sessionId после успешной регистрации
		res.cookie('sessionId', user.id, {
			httpOnly: true,
			secure: true,
			maxAge: 60 * 60 * 24 * 7 * 1000,
		}) // 7 дней
		res.status(201).json({ user })
	} catch (error) {
		res.status(400).json({ message: error.message })
	}
}

// Логин пользователя
export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body
	try {
		// Логин пользователя и создание сессии
		const { user } = await authService.login(email, password)

		// Генерация sessionId после успешного логина
		res.cookie('sessionId', user.id, {
			httpOnly: true,
			secure: true,
			maxAge: 60 * 60 * 24 * 7 * 1000,
		}) // 7 дней
		res.status(200).json({ user })
	} catch (error) {
		res.status(400).json({ message: error.message })
	}
}

// Логаут пользователя
export const logout = async (req: Request, res: Response) => {
	const { sessionId } = req.cookies
	try {
		// Удаляем сессию из Redis
		await authService.logout(sessionId)

		// Очищаем cookie
		res.clearCookie('sessionId')
		res.status(200).json({ message: 'Logged out successfully' })
	} catch (error) {
		res.status(400).json({ message: error.message })
	}
}
