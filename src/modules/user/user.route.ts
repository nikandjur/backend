import { Router } from 'express'
import {
	getUserPosts,
	getUserProfile,
	updateUserProfile,
} from './user.controller.js'
import {
	paginationSchema,
	profileUpdateSchema,
	userIdParamsSchema,
} from './user.schema.js'
import { validate } from '../../core/middleware/validation.js'
import { authenticate } from '../../core/middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Обновить профиль текущего пользователя
 *     description: Изменяет данные профиля текущего авторизованного пользователя
 *     tags: [Users]
 *     operationId: updateCurrentUserProfile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Новые данные профиля
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Профиль успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации входных данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidation'
 *       401:
 *         description: Неавторизованный доступ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
router.put(
	'/profile',
	authenticate,
	validate(profileUpdateSchema),
	updateUserProfile
)

/**
 * @swagger
 * /api/user/{userId}/posts:
 *   get:
 *     summary: Получить список постов пользователя с пагинацией
 *     description: Возвращает список постов указанного пользователя с поддержкой пагинации
 *     tags: [Posts]
 *     operationId: getUserPosts
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: Идентификатор пользователя (cuid)
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Номер страницы
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Количество записей на странице
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Список постов пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: Пользователь или посты не найдены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
router.get(
	'/:userId/posts',
	validate(userIdParamsSchema, 'params'),
	validate(paginationSchema, 'query'),
	getUserPosts
)

/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Получить профиль пользователя по ID
 *     description: Возвращает данные профиля пользователя по его идентификатору
 *     tags: [Users]
 *     operationId: getUserProfileById
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: Идентификатор пользователя (cuid)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
router.get('/:userId', validate(userIdParamsSchema, 'params'), getUserProfile)

export default router
