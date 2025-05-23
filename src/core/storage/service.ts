import { logger } from '../services/logger.js'
import { bucketName, minioClient } from './client.js'

export const initStorage = async () => {
	try {
		const exists = await minioClient.bucketExists(bucketName)
		if (!exists) {
			await minioClient.makeBucket(bucketName, 'us-east-1')
			logger.info(`Bucket ${bucketName} created`)
		}

		await minioClient.setBucketPolicy(
			bucketName,
			JSON.stringify({
				Version: '2012-10-17',
				Statement: [
					{
						Effect: 'Allow',
						Principal: '*',
						Action: ['s3:GetObject'],
						Resource: [`arn:aws:s3:::${bucketName}/*`],
					},
				],
			})
		)
	} catch (error) {
		logger.error('Storage init failed', { error })
		throw error
	}
}

export const generatePresignedUrl = async (
	objectName: string,
	expiry = 3600
) => {
	return minioClient.presignedPutObject(bucketName, objectName, expiry)
}

export const getObjectUrl = (objectName: string) => {
	const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
	return `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`
}

export const generateAvatarUploadData = async (userId: string) => {
	const objectName = `avatars/${userId}-${Date.now()}`
	return {
		uploadUrl: await generatePresignedUrl(objectName),
		objectName,
		accessUrl: getObjectUrl(objectName),
	}
}

export const validateAvatarObjectName = (
	userId: string,
	objectName: string
) => {
	if (!objectName.startsWith(`avatars/${userId}`)) {
		throw new Error('Invalid avatar object name')
	}
	return getObjectUrl(objectName)
}
