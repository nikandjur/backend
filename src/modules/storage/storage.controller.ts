import { Request, Response } from 'express'
import { handleError } from '../../core/utils/errorHandler.js'
import {
	generatePresignedUrl,
	getObjectUrl,
	generateAvatarUploadData,
	validateAvatarObjectName,
} from '../../core/services/storage/service.js'

export const handleGenerateUploadUrl = async (req: Request, res: Response) => {
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
		handleError(res, err)
	}
}

export const handleGenerateAvatarUrl = async (req: Request, res: Response) => {
	try {
		const data = await generateAvatarUploadData(req.user!.id)
		res.json(data)
	} catch (err) {
		handleError(res, err)
	}
}

export const handleConfirmAvatar = async (req: Request, res: Response) => {
	try {
		const avatarUrl = validateAvatarObjectName(
			req.user!.id,
			req.body.objectName
		)
		res.json({ avatarUrl })
	} catch (err) {
		handleError(res, err)
	}
}
