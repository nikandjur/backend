import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate, sessionMiddleware } from '../../core/auth/middleware.js'
import { validate } from '../../core/utils/validation.js'
import { 
  getCurrentUser,
  login,
  logout,
  register,
  resendVerificationHandler,
  verifyEmailHandler,
} from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schema.js'

const router = Router()
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5,
  message: 'Too many login attempts, please try later',
});
router.use(sessionMiddleware)
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Авторизация и аутентификация
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации
 */
router.post('/register', validate(registerSchema), register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *       400:
 *         description: Неверные данные
 */
router.post('/login', verificationLimiter, validate(loginSchema), login)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход пользователя (удаление sessionId из cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Успешный выход
 *       401:
 *         description: Недействительный sessionId
 */
router.post('/logout', authenticate, logout)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Аутентифицированный пользователь
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Неавторизован
 */
router.get('/me', authenticate, getCurrentUser)

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Подтверждение email
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
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверный или просроченный токен
 */
router.get('/verify-email', verifyEmailHandler)

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Повторная отправка письма подтверждения
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Письмо отправлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Email уже подтвержден
 *       429:
 *         description: Слишком много запросов (лимит 5 в час)
 */
router.post(
	'/resend-verification',
	authenticate,
	verificationLimiter,
	resendVerificationHandler
)


export default router
