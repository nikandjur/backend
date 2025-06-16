import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
	authenticate,
	sessionMiddleware,
} from '../../core/middleware/middleware.js'
import {
	getCurrentUser,
	login,
	logout,
	register,
	resendVerificationHandler,
	verifyEmailHandler,
} from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.schema.js'
import { validate } from '../../core/middleware/validation.js'

const router = Router()
const verificationLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 минут
	max: 5,
	message: 'Too many requests, please try again later',
})

router.use(sessionMiddleware)

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     description: Создает нового пользователя и отправляет письмо подтверждения email
 *     tags: [Auth]
 *     operationId: registerUser
 *     requestBody:
 *       required: true
 *       description: Данные нового пользователя
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IdResponse'
 *       400:
 *         description: Ошибка валидации входных данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidation'
 */
router.post('/register', validate(registerSchema, 'body'), register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     description: Аутентификация пользователя по email и паролю
 *     tags: [Auth]
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       description: Данные для аутентификации
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Неверные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidation'
 *       401:
 *         description: Неавторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
router.post('/login', verificationLimiter, validate(loginSchema, 'body'), login)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход пользователя (удаление sessionId из cookie)
 *     description: Завершает текущую сессию пользователя
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Недействительный sessionId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
router.post('/logout', authenticate, logout)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     description: Возвращает данные авторизованного пользователя
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Аутентифицированный пользователь
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Неавторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
router.get('/me', authenticate, getCurrentUser)

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Подтверждение email
 *     description: Подтверждает email пользователя по токену из ссылки
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Токен подтверждения email
 *     responses:
 *       200:
 *         description: Email успешно подтвержден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyEmailResponse'
 *       400:
 *         description: Неверный или просроченный токен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidation'
 */
router.get('/verify-email', verifyEmailHandler)

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Повторная отправка письма подтверждения
 *     description: Отправляет повторное письмо подтверждения email
 *     tags: [Auth]
 *     operationId: resendVerificationEmail
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Письмо отправлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResendVerificationResponse'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: Email уже подтвержден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       429:
 *         description: Слишком много запросов (лимит 5 в час)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TooManyRequests'
 */
router.post(
	'/resend-verification',
	authenticate,
	verificationLimiter,
	resendVerificationHandler
)

export default router
