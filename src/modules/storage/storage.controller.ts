// src/modules/storage/storage.controller.ts
import { Request, Response } from 'express'
import { prisma } from '../../db.js'
import {
	generateAvatarUploadData,
	validateAvatarObjectName,
} from '../../core/storage/service.js'
import { avatarQueue } from '../../core/storage/avatar.queue.js'
import { ERRORS } from '../../core/utils/errors.js'
import { bucketName, minioClient } from '../../core/storage/client.js'

export const handleGenerateAvatarUrl = async (req: Request, res: Response) => {
	const userId = req.user?.id
	if (!userId) throw ERRORS.unauthorized()

	const { uploadUrl, objectName } = await generateAvatarUploadData(userId)

	res.json({ uploadUrl, key: objectName })
}

export const handleConfirmAvatar = async (req: Request, res: Response) => {
	const userId = req.user?.id
	if (!userId) throw ERRORS.unauthorized()

	const { key } = req.body
	validateAvatarObjectName(userId, key)

	await avatarQueue.add('optimize-avatar', { userId, originalPath: key })
const optimizedPath = `avatars/${userId}.webp`
	res.json({
		success: true,
		message: 'Avatar processing started',
		avatarUrl: optimizedPath,
	})
}

export const handleDeleteAvatar = async (req: Request, res: Response) => {
	const userId = req.user?.id
	if (!userId) throw ERRORS.unauthorized()

	const user = await prisma.user.findUnique({ where: { id: userId } })
	if (!user?.avatarUrl) {
		throw ERRORS.badRequest('User has no avatar')
	}

	const key = user.avatarUrl // например: 'avatars/cmbkps6jl0000ppqoh8gu2tn0.webp'

	try {
		await minioClient.removeObject(bucketName, key)
	} catch (err) {
		// можно игнорировать ошибку удаления, если файла нет
	}

	await prisma.user.update({
		where: { id: userId },
		data: { avatarUrl: null },
	})

	res.json({ success: true, message: 'Avatar deleted' })
}

export const handleGetMediaFile = async (req: Request, res: Response) => {
	const { path } = req.query

	if (typeof path !== 'string' || !path) {
			throw ERRORS.badRequest('Path parameter is required')
	}

	const decodedPath = decodeURIComponent(path)

	try {
			const stream = await minioClient.getObject(bucketName, decodedPath)
			const contentType = decodedPath.endsWith('.webp') ? 'image/webp' : 'application/octet-stream'

			res.header('Content-Type', contentType)
			stream.pipe(res)
	} catch (error) {
			throw ERRORS.notFound(`File not found: ${decodedPath}`)
	}
}