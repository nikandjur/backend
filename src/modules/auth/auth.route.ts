import { Router } from 'express'
import { validate } from '../../middleware/validation.js'
import { getCurrentUser, login, logout, register } from './auth.controller.js'
import { authenticate } from './auth.middleware.js'
import { loginSchema, registerSchema } from './auth.schema.js'

const router = Router()

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
router.post('/login', validate(loginSchema), login)

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
router.post('/logout', logout)

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

export default router
