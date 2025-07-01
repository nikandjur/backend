// src/core/storage/service.ts
import { logger } from '../services/logger.js'
import { bucketName, minioClient, tempBucketName } from './client.js'

export const initStorage = async () => {
	try {
		const exists = await minioClient.bucketExists(bucketName)
		if (!exists) {
			await minioClient.makeBucket(bucketName, 'us-east-1')
			logger.info(`Bucket ${bucketName} created`)
		}

		const existsTemp = await minioClient.bucketExists(tempBucketName)
		if (!existsTemp) {
			await minioClient.makeBucket(tempBucketName, 'us-east-1')
			logger.info(`Temporary bucket ${tempBucketName} created`)
		}

		// Настройка автоочистки
		await setupTempBucketLifecycle()

		// Политики доступа
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
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error('Storage init failed', { error: error.message });
		} else {
			logger.error('Storage init failed', { error: String(error) });
		}
		throw error;
	}
}

export const generatePresignedUrl = async (
	temporary: boolean = false,
	objectName: string,
	expiry = 3600
) => {
	const bucket = temporary ? tempBucketName : bucketName
	return minioClient.presignedPutObject(bucket, objectName, expiry)
}

export const getObjectUrl = (objectName: string) => {
	const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
	return `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`
}

export const generateAvatarUploadData = async (userId: string) => {
	const objectName = `avatars/${userId}-${Date.now()}.jpg`
	const uploadUrl = await generatePresignedUrl(true, objectName)

	return {
		uploadUrl,
		objectName,
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

export const setupTempBucketLifecycle = async () => {
	try {
		await minioClient.setBucketLifecycle(tempBucketName, {
			Rule: [
				{
					ID: 'clean-temp',
					Status: 'Enabled',
					Expiration: { Days: 1 },
					Filter: { Prefix: '' }, // Все объекты в бакете
				},
			],
		})
		logger.info(`Lifecycle policy applied to ${tempBucketName}`)
	} catch (error) {
		logger.error('Failed to apply lifecycle policy', { error })
	}
}