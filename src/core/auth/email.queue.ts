import { Queue } from 'bullmq'
import { EmailJob } from '../services/email.js' // Типы для задач
import redis from '../services/redis/client.js'

export const emailQueue = new Queue<EmailJob>('email-verification', {
	connection: redis,
	defaultJobOptions: {
		attempts: 3, // 3 попытки
		backoff: { type: 'exponential', delay: 1000 }, // Экспоненциальная задержка
		removeOnComplete: true,
		removeOnFail: false, // Сохранять неудачные задачи для анализа
	},
})
