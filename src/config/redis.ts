import Redis from 'ioredis'

// Логируем для отладки
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379'
console.log('🔌 Connecting to Redis at:', redisUrl)

const redis = new Redis(redisUrl)

redis.on('connect', () => {
	console.log('✅ Connected to Redis')
})

redis.on('error', err => {
	console.error('❌ Redis error:', err)
})

export default redis
