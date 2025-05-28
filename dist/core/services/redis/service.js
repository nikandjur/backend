// src/core/services/redis/service.ts
import redis from './client.js';
export const redisService = {
    // Универсальные методы
    set: (key, value, ttl) => ttl ? redis.set(key, value, 'EX', ttl) : redis.set(key, value),
    get: (key) => redis.get(key),
    del: (key) => redis.del(key),
    keys: (pattern) => redis.keys(pattern),
    // Специализированные методы (для удобства)
    setVerificationToken: (token, userId, ttl) => redis.set(`email-verification:${token}`, userId, 'EX', ttl),
    getVerificationToken: (token) => redis.get(`email-verification:${token}`),
    deleteVerificationToken: (token) => redis.del(`email-verification:${token}`),
};
