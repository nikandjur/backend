// test-add-job.ts
import { Queue } from 'bullmq'
import redis from './src/core/services/redis/client.js'


const queue = new Queue('avatar-optimization', { connection: redis })

async function addJob() {
	await queue.add('test-job', {
		userId: 'test-user-1',
		originalPath: 'test/avatar.jpg',
	})
	console.log('✅ Тестовая задача добавлена')
}

addJob().finally(() => queue.close())
