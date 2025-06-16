import { Worker } from 'bullmq'
import { logger } from '../services/logger.js'
import redis from '../services/redis/client.js'
import { sendVerificationEmail } from './email.js'
import { EmailJob } from './email.js'

export const emailWorker = new Worker<EmailJob>(
	'email-verification',
	async job => {
		const { email, token } = job.data
		await sendVerificationEmail(email, token)
	},
	{
		connection: redis,
		concurrency: 5, // Можно обрабатывать до 5 писем одновременно
	}
)

console.log('email - worker')

emailWorker.on('failed', (job, error) => {
	logger.error(`Email sending failed for ${job?.data.email}: ${error.message}`)
})

emailWorker.on('completed', job => {
	logger.info(`Email sent to ${job.data.email}`)
})
