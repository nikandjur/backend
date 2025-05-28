import crypto from 'crypto';
import redis from '../services/redis/client.js';
const TOKEN_TTL = 24 * 60 * 60; // 24 часа
export const generateVerificationToken = async (userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    await redis.set(`email-verification:${token}`, userId, 'EX', TOKEN_TTL);
    return token;
};
export const verifyEmailToken = async (token) => {
    const userId = await redis.get(`email-verification:${token}`);
    if (!userId)
        throw new Error('Invalid token');
    // Удаляем токен после использования
    await redis.del(`email-verification:${token}`);
    return userId;
};
