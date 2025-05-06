// test-worker.ts
import { Queue } from 'bullmq'
import redis from './src/core/services/redis/client.js'
// import redis from './core/services/redis/client'

const testQueue = new Queue('avatar-optimization', { connection: redis })

async function addTestJob() {
	await testQueue.add('test-job', {
		userId: 'test-user-123',
		originalPath: 'test/avatar.jpg',
	})
	console.log('✅ Test job added')
}

addTestJob().catch(console.error)
