import { Queue } from 'bullmq'
import redis from '../services/redis/client.js'
import { EmailJob } from './email.js' // Типы для задач

export const emailQueue = new Queue<EmailJob>('email-verification', {
	connection: redis,
	defaultJobOptions: {
		attempts: 3, // 3 попытки
		backoff: { type: 'exponential', delay: 1000 }, // Экспоненциальная задержка
		removeOnComplete: true,
		removeOnFail: false, // Сохранять неудачные задачи для анализа
	},
})
