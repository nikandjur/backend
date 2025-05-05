
import Redis from 'ioredis'

// Проверка с подробным выводом
console.log('ENV Variables:', {
	REDIS_URL: process.env.REDIS_URL,
	NODE_ENV: process.env.NODE_ENV,
})

if (!process.env.REDIS_URL) {
	console.error('❌ REDIS_URL is not defined in environment variables')
	process.exit(1) // Завершаем процесс с ошибкой
}

// Настройки Redis
const redisOptions = {
	connectTimeout: 5000, // Таймаут подключения в миллисекундах
	retryStrategy: (times: number) => {
		const delay = Math.min(times * 50, 2000) // Задержка увеличивается до 2 секунд
		console.warn(`Retrying connection after ${delay}ms (${times} attempt(s))`)
		return delay
	},
}

// Создаем экземпляр Redis
const redis = new Redis(process.env.REDIS_URL, redisOptions)

// Базовые обработчики событий
redis.on('connect', () => console.log('✅ Connected to Redis'))
redis.on('error', err => console.error('❌ Redis error:', err))
redis.on('reconnecting', () => console.warn('🔄 Reconnecting to Redis'))
redis.on('ready', () => console.log('👍 Redis ready'))

export default redis
