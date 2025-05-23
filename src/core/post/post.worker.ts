import { Worker } from 'bullmq'
import { prisma } from '../../db.js'
import { logger } from '../services/logger.js'
import redis from '../services/redis/client.js'
import { ActivityJob } from './post.types.js'

export const createPostWorker = new Worker<ActivityJob>(
	'post-activity',
	async job => {
		const { type, postId } = job.data
		const updateMap = {
			like: { likesCount: { increment: 1 } },
			view: { views: { increment: 1 } },
		}

		if (updateMap[type]) {
			await prisma.post.update({
				where: { id: postId },
				data: updateMap[type],
			})
		}
	},
	{
		connection: redis,
		concurrency: 3,
		limiter: {
			max: 10,
			duration: 5000,
		},
	}
)
console.log('post - worker')

createPostWorker.on('failed', (job, error) => {
	logger.error(`Job ${job?.id} failed: ${error.message}`)
})
createPostWorker.on('completed', job => {
	if (!job.processedOn || !job.timestamp) return

	logger.info({
		event: 'post_processed',
		postId: job.data.postId,
		duration: job.processedOn - job.timestamp,
	})
})
