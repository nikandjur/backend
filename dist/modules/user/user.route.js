import { Router } from 'express';
import { authenticate } from '../../core/middleware/middleware.js';
import { getUserPosts, getUserProfile, updateUserProfile, } from './user.controller.js';
import { paginationSchema, profileUpdateSchema, userIdParamsSchema, } from './user.schema.js';
import { validate } from '../../core/middleware/validation.js';
const router = Router();
/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Обновить профиль текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               website:
 *                 type: string
 *                 format: uri
 *             example:
 *               name: "Иван Петров"
 *               bio: "Люблю разрабатывать API"
 *               website: "https://example.com "
 *     responses:
 *       200:
 *         description: Обновлённый профиль
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 website:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.put('/profile', authenticate, validate(profileUpdateSchema), updateUserProfile);
/**
 * @swagger
 * /api/user/{userId}/posts:
 *   get:
 *     summary: Получить список постов пользователя с пагинацией
 *     tags: [Posts]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID пользователя (cuid)
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
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   excerpt:
 *                     type: string
 *       404:
 *         description: Пользователь или посты не найдены
 */
router.get('/:userId/posts', validate(userIdParamsSchema, 'params'), validate(paginationSchema, 'query'), getUserPosts);
/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Получить профиль пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID пользователя (cuid)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: Пользователь не найден
 */
router.get('/:userId', validate(userIdParamsSchema, 'params'), getUserProfile);
export default router;
