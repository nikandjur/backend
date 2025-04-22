import cors from 'cors'
import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { setupSwagger } from './docs/swagger.js'
import { authRouter } from './modules/auth/index.js'
import { RedisService } from './redis/redis.service.js'
import { redisSession } from './middleware/redis-session.js'
import { errorHandler } from './middleware/error-handler.js'


const app = express()

app.use(cors())
app.use(helmet())

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// Redis-сессии
app.use(redisSession())

// Роуты
app.use('/api/auth', authRouter)

// Обработка ошибок (должен быть последним!)
app.use(errorHandler)

export default app
