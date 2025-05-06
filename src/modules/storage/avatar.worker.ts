import { Worker } from 'bullmq'
import 'dotenv/config'
import sharp from 'sharp'
import { logger } from '../../core/services/logger.js'
import redis from '../../core/services/redis/client.js'
import { minioClient } from '../../core/services/storage/client.js'

const worker = new Worker(
	'avatar-optimization',
	async job => {
		try {
			const { userId, originalPath } = job.data
			logger.info(`Processing avatar for user ${userId}, path: ${originalPath}`)

			// 1. Получение файла из MinIO
			const stream = await minioClient.getObject('uploads', originalPath)
			const chunks: Buffer[] = []

			for await (const chunk of stream) {
				chunks.push(chunk)
			}
			const originalBuffer = Buffer.concat(chunks)

			// 2. Оптимизация с Sharp
			const optimizedBuffer = await sharp(originalBuffer)
				.resize(500, 500, {
					fit: 'inside',
					withoutEnlargement: true,
				})
				.webp({ quality: 80 })
				.toBuffer()

			// 3. Сохранение оптимизированного файла
			const optimizedPath = `optimized/${userId}-${Date.now()}.webp`
			await minioClient.putObject('uploads', optimizedPath, optimizedBuffer)

			// 4. Удаление исходного файла (опционально)
			await minioClient.removeObject('uploads', originalPath)
			logger.info(`Avatar optimized and saved to ${optimizedPath}`)

			return optimizedPath
		} catch (error) {
			logger.error('Avatar processing failed', { error })
			throw error
		}
	},
	{ connection: redis }
)

worker.on('failed', (job, error) => {
	logger.error(`Job ${job?.id} failed: ${error.message}`)
})
