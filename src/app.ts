import cookieParser from 'cookie-parser'
import cors from 'cors'
import { setupSwagger } from './docs/swagger.js'
import express from 'express'
import helmet from 'helmet'
import { errorHandler } from './middleware/error-handler.js'
import { redisSession } from './middleware/redis-session.js'
import { authRouter } from './modules/auth/index.js'

const app = express()
setupSwagger(app)
// Базовые middleware
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || true,
		credentials: true,
	})
)
app.use(helmet())
app.use(express.json())
app.use((req, _, next) => {
	console.log('➡️ RAW headers', req.headers.cookie)
	next()
})

app.use(cookieParser())

// Redis-сессии
app.use(redisSession())

// Роуты
app.use('/api/auth', authRouter)

// Обработка ошибок
app.use(errorHandler)

export default app
