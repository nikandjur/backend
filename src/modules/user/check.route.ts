// src/modules/user/check.route.ts
import { Router } from 'express'
import { checkEmailAvailability } from './check.controller.js'
import rateLimit from 'express-rate-limit'

export const checkRouteLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 минут
	max: 10, // максимум 10 запросов
	message: { error: 'Too many requests, please try again later' },
	standardHeaders: true,
	legacyHeaders: false,
})

const router = Router()

/**
 * @swagger
 * /api/check/email:
 *   get:
 *     summary: Проверяет доступность email
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *           example: "test@example.com"
 *     responses:
 *       200:
 *         description: Результат проверки
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Неверный формат email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidation'
 *       429:
 *         description: Слишком много запросов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorTooManyRequests'
 */
router.get('/email', checkRouteLimiter, checkEmailAvailability)

export default router
