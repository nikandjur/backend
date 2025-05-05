import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { authenticate, sessionMiddleware } from './core/auth/middleware.js'
import { httpLogger, logger } from './core/services/logger.js'
import { handleError } from './core/utils/errorHandler.js'
import { setupSwagger } from './docs/swagger.js'
import { authRouter } from './modules/auth/index.js'
import userRouter from './modules/user/user.route.js'
import { initStorage } from './core/services/storage/service.js'

// Обработка необработанных Promise-отклонений
process.on('unhandledRejection', (reason: unknown) => {
	logger.error('Unhandled Rejection:', reason)
})

// Инициализация MinIO
initStorage().catch(error => {
	logger.error('MinIO init error', { error })
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
app.use(express.json({ limit: '10kb', strict: true }))

// Логирование входящих запросов
app.use(httpLogger)
app.use(cookieParser())


// Swagger документация

// API роуты
app.use(sessionMiddleware) // Для всех роутов
setupSwagger(app)
app.use('/api/protected', authenticate) // Только для защищённых роутов
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

// Обработка ошибок (новая версия)
app.use(
	(
		err: unknown,
		req: express.Request,
		res: express.Response,
		_next: express.NextFunction
	) => {
		handleError(res, err)
	}
)

export default app
