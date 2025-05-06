// src/modules/avatar/avatar.queue.ts
import { Queue } from 'bullmq'
import  redis  from '../../core/services/redis/client'

export const avatarQueue = new Queue('avatar-optimization', {
	connection: redis,
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: 'exponential', delay: 1000 },
	},
})
