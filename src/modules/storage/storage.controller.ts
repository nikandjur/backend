import { NextFunction, Request, Response } from 'express'
import {
	generateAvatarUploadData,
	generatePresignedUrl,
	getObjectUrl,
	validateAvatarObjectName,
} from '../../core/services/storage/service.js'
import { avatarQueue } from './avatar.queue'

export const handleGenerateUploadUrl = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { prefix } = req.body
		const objectName = `uploads/${req.user!.id}-${Date.now()}${
			prefix ? `-${prefix}` : ''
		}`
		res.json({
			uploadUrl: await generatePresignedUrl(objectName),
			objectName,
			accessUrl: getObjectUrl(objectName),
		})
	} catch (err) {
		next(err)
	}
}

export const handleGenerateAvatarUrl = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = await generateAvatarUploadData(req.user!.id)
		res.json(data)
	} catch (err) {
		next(err)
	}
}


export const handleConfirmAvatar = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const avatarUrl = validateAvatarObjectName(
			req.user!.id,
			req.body.objectName
		)

		// Добавляем задачу в очередь
		await avatarQueue.add('optimize-avatar', {
			userId: req.user!.id,
			originalPath: req.body.objectName,
		})

		res.json({ avatarUrl })
	} catch (err) {
		next(err)
	}
}