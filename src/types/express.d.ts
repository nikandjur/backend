// types/express.d.ts
import { User } from '@prisma/client' // Если используете Prisma
import { Session } from 'express-session'

declare global {
	namespace Express {
		// Расширяем Request для добавления пользователя и сессии
		interface Request {
			/**
			 * Авторизованный пользователь
			 * Заполняется в auth middleware
			 */
			user?: Pick<User, 'id' | 'email' | 'role'> & {
				permissions?: string[] // Дополнительные права
			}

			/**
			 * Данные текущей сессии
			 */
			session?: {
				id: string // ID сессии в Redis
				ip?: string // IP-адрес клиента
				userAgent?: string // User-Agent браузера
				createdAt: Date // Время создания
			}

			/**
			 * Для логирования и трейсинга
			 */
			requestId?: string
		}

		// Расширяем Response для стандартизированных ответов
		interface Response {
			/**
			 * Успешный ответ
			 * @example res.sendSuccess({ data: user })
			 */
			sendSuccess<T = unknown>(data: T, meta?: unknown): this

			/**
			 * Ответ с ошибкой
			 * @example res.sendError({ message: 'Not found', code: 'NOT_FOUND' })
			 */
			sendError(error: {
				message: string
				code?: string
				details?: unknown
				statusCode?: number
			}): this
		}
	}
}

// Расширяем express-session для работы с сессиями
declare module 'express-session' {
	interface SessionData {
		/**
		 * ID пользователя в системе
		 */
		userId: string

		/**
		 * Данные для аудита и безопасности
		 */
		meta?: {
			ip: string
			userAgent: string
			firstAccessed: Date
			lastAccessed: Date
		}
	}
}

// Расширяем Error для обработки в error-handler middleware
declare module 'express' {
	interface Error {
		statusCode?: number
		code?: string
		details?: unknown
		expose?: boolean
	}
}
