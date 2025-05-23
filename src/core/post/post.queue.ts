import { Queue } from 'bullmq'
import redis from '../services/redis/client.js'
import { ActivityJob } from './post.types.js'

export const postQueue = new Queue<ActivityJob>('post-activity', {
	connection: redis,
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: 'exponential', delay: 1000 },
		removeOnComplete: true,
		removeOnFail: true,
	},
})
