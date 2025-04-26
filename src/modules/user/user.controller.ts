import { Request, Response } from 'express'
import { handleError } from '../../core/utils/errorHandler.js'
// import { verifyEmail } from '../user/service.js'
import {
	confirmUserAvatar,
	generateUserAvatarUploadUrl,
	verifyEmailUser,
} from './user.service.js'

export const verifyEmailHandler = async (req: Request, res: Response) => {
	try {
		const { token } = req.query // Получаем token из query параметров
		const user = await verifyEmailUser(token as string) // Передаем строку
		res.json({ user })
	} catch (err) {
		handleError(res, err)
	}
}

export const generateAvatarUrl = async (req: Request, res: Response) => {
	try {
		const data = await generateUserAvatarUploadUrl(req.user!.id)
		res.json(data)
	} catch (err) {
		handleError(res, err)
	}
}

export const confirmAvatar = async (req: Request, res: Response) => {
	try {
		const user = await confirmUserAvatar(req.user!.id, req.body.objectName)
		res.json(user)
	} catch (err) {
		handleError(res, err)
	}
}
