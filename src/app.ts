import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import qs from 'qs'
import { authenticate, sessionMiddleware } from './core/auth/middleware.js'
import { initRoles } from './core/roles/init.js'
import { httpLogger, logger } from './core/services/logger.js'
import { metrics } from './core/services/metrics'
import { initStorage } from './core/services/storage/service.js'
import { handleError } from './core/utils/errorHandler.js'
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
// Middleware для сбора метрик
app.use((req, res, next) => {
	const end = metrics.httpRequestDuration.startTimer()
	const route = req.route?.path || req.path

	res.on('finish', () => {
		metrics.httpRequestsTotal.inc({
			method: req.method,
			route,
			status: res.statusCode,
		})
		end({ method: req.method, route })
	})

	next()
})
// Логирование входящих запросов
app.use(httpLogger)

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

app.use(handleError) // Обработка ошибок (старая версия, для совместимости с другими модулями)

export default app
