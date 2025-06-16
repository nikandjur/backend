// src/core/storage/avatar.worker.ts
import { Worker } from 'bullmq'
import sharp from 'sharp'
import { logger } from '../services/logger.js'
import redis from '../services/redis/client.js'
import { minioClient, bucketName, tempBucketName } from './client.js'
import { prisma } from '../../db.js'

const worker = new Worker(
	'avatar-optimization',
	async job => {
		const { userId, originalPath } = job.data
		logger.info(`Processing avatar for user ${userId}, path: ${originalPath}`)

		try {
			const stream = await minioClient.getObject(tempBucketName, originalPath)
			const chunks: Buffer[] = []
			for await (const chunk of stream) {
				chunks.push(chunk)
			}
			const originalBuffer = Buffer.concat(chunks)

			const optimizedBuffer = await sharp(originalBuffer)
				.resize(500, 500, {
					fit: 'inside',
					withoutEnlargement: true,
				})
				.webp({ quality: 80 })
				.toBuffer()

			const optimizedPath = `avatars/${userId}.webp`

			// Сохраняем оптимизированный файл в основной бакет
			await minioClient.putObject(bucketName, optimizedPath, optimizedBuffer)

			// Удаляем временный файл
			await minioClient.removeObject(tempBucketName, originalPath)

			// Обновляем путь в БД
			await prisma.user.update({
				where: { id: userId },
				data: { avatarUrl: optimizedPath }, // avatars/userid.webp
			})

			return optimizedPath
		} catch (error) {
			logger.error('Avatar processing failed', { error })
			throw error
		}
	},
	{ connection: redis }
)

worker.on('failed', async job => {
	const { userId, originalPath } = job?.data
	logger.warn(`Deleting unprocessed avatar file: ${originalPath}`)
	try {
		await minioClient.removeObject(tempBucketName, originalPath)
	} catch (err) {
		logger.error('Failed to delete unprocessed avatar', { err })
	}
})

console.log('Avatar worker is running...')
export default worker
