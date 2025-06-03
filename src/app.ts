import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import qs from 'qs'
import { handleError } from './core/middleware/handlerError.js'
import { httpLogger } from './core/middleware/httpLogger.js'
import { register } from './core/middleware/metrics.js'
import { metricsMiddleware } from './core/middleware/metrics.middleware.js'
import {
	authenticate,
	sessionMiddleware,
} from './core/middleware/middleware.js'
import { slowRequestLogger } from './core/middleware/slowRequestLogger.js'
import { initRoles } from './core/roles/init.js'
import { logger } from './core/services/logger.js'
import { initStorage } from './core/storage/service.js'
import { setupSwagger } from './docs/swagger.js'
import authRouter from './modules/auth/auth.route.js'
import commentRouter from './modules/comment/comment.route.js'
import { serverAdapter } from './modules/monitoring/bull-board.js'
import postRoutes from './modules/post/post.route.js'
import storageRouter from './modules/storage/storage.route.js'
import userRouter from './modules/user/user.route.js'

// Обработка необработанных Promise-отклонений
process.on('unhandledRejection', (reason: unknown) => {
	logger.error('Unhandled Rejection:', reason)
})

// Инициализация MinIO
initStorage().catch(error => {
	logger.error('MinIO init error', { error })
})

initRoles()

const app = express()
app.use(httpLogger)
app.use(slowRequestLogger(300)) // Логировать запросы дольше 300мс
app.use(metricsMiddleware) // Middleware для сбора метрик

// Эндпоинт /metrics
app.get('/metrics', async (req, res) => {
	res.set('Content-Type', register.contentType)
	res.end(await register.metrics())
})

// Логирование входящих запросов

app.set('query parser', (str: string) => {
	try {
		return qs.parse(str, { allowDots: true, parameterLimit: 100, depth: 5 })
	} catch {
		return {}
	}
})

// Базовые middleware
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || true,
		credentials: true,
	})
)
app.use(helmet())
app.use(express.urlencoded({ extended: false, limit: '10kb' })) // Защита от CSRF-атак
app.use(express.json({ limit: '10kb', strict: true }))

app.use(cookieParser())

// API роуты
app.use('/admin/queues', serverAdapter.getRouter())
app.use(sessionMiddleware) // Для всех роутов

setupSwagger(app)

app.use('/api/protected', authenticate)
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/posts', postRoutes)
app.use('/api', storageRouter)
app.use('/api', commentRouter)

app.use(handleError) // Обработка ошибок

export default app
