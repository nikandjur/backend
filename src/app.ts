import cookieParser from 'cookie-parser'
import cors from 'cors'
import { setupSwagger } from './docs/swagger.js'
import express from 'express'
import helmet from 'helmet'
import { errorHandler } from './middleware/error-handler.js'
import { redisSession } from './middleware/redis-session.js'
import { authRouter } from './modules/auth/index.js'
import userRouter from './modules/user/user.route.js'
import { initMinio } from './modules/storage/storage.service.js'

// Обработка необработанных Promise-отклонений
process.on('unhandledRejection', (reason: unknown) => {
	console.error('⚠️ Unhandled Rejection at:', reason)
	// Здесь можно добавить отправку ошибки в Sentry/Logging сервис
})

// Инициализация MinIO
initMinio()
	.then(() => {
		console.log('✅ Storage service ready')
	})
	.catch(error => {
		console.error('⚠️ Storage service initialization warning:', error.message)
	})

const app = express()

// Базовые middleware
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || true,
		credentials: true,
	})
)
app.use(helmet())
app.use(express.json({ limit: '10kb' })) // Лимит размера JSON

// Логирование входящих запросов (только для разработки)
if (process.env.NODE_ENV === 'development') {
	app.use((req, _, next) => {
		console.log('➡️ Incoming request:', req.method, req.path)
		next()
	})
}

app.use(cookieParser())

// Redis-сессии
app.use(redisSession())

// Swagger документация
setupSwagger(app)

// API роуты
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

// Health check endpoint
app.get('/health', (_, res) => {
	res.status(200).json({ status: 'ok' })
})

// Обработка ошибок
app.use(errorHandler)

export default app
