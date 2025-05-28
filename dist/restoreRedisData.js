import redis from './core/services/redis/client.js';
import { prisma } from './db.js';
import { logger } from './core/services/logger.js';
export const restoreRedisData = async () => {
    try {
        const activePosts = await prisma.post.findMany({
            where: { OR: [{ likesCount: { gt: 0 } }, { views: { gt: 0 } }] },
        });
        logger.info(`Restoring ${activePosts.length} posts to Redis...`);
        for (const post of activePosts) {
            await redis.hset(`post:${post.id}:stats`, {
                likes: post.likesCount.toString(),
                views: post.views.toString(), // Исправлено: было post.likesCount
            });
        }
        logger.info('Redis data restored successfully');
    }
    catch (error) {
        logger.error('Failed to restore Redis data:', error);
        throw error;
    }
};
