import 'dotenv/config'
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

// Создаем экземпляр Redis
const redis = new Redis(process.env.REDIS_URL)

// Базовые обработчики событий
redis.on('connect', () => console.log('✅ Connected to Redis'))
redis.on('error', err => console.error('❌ Redis error:', err))

export default redis
