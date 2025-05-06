import { ExpressAdapter } from '@bull-board/express'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { createBullBoard } from '@bull-board/api'
import { avatarQueue } from '../storage/avatar.queue.js' // Импорт вашей очереди

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
	queues: [new BullMQAdapter(avatarQueue)],
	serverAdapter: serverAdapter,
})

export { serverAdapter }
