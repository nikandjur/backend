import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { avatarQueue } from '../../core/storage/avatar.queue.js';
import { postQueue } from '../../core/post/post.queue.js';
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
    queues: [new BullMQAdapter(avatarQueue), new BullMQAdapter(postQueue)],
    serverAdapter,
});
export { serverAdapter };
