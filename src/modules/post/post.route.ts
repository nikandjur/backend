// src/modules/post/post.route.ts
import { Router } from 'express'
import { authenticate } from '../../core/auth/middleware.js'
import { validate } from '../../core/utils/validation.js'
import { postController } from './post.controller.js'
import { postSchema } from './post.schema.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Управление постами
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clnjak7xj000008l0a9zq3k4f"
 *         title:
 *           type: string
 *           example: "Мой первый пост"
 *         content:
 *           type: string
 *           example: "Содержание моего первого поста"
 *         likes:
 *           type: integer
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-01T12:00:00Z"
 *         author:
 *           $ref: '#/components/schemas/User'
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *     PostCreate:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "Мой первый пост"
 *         content:
 *           type: string
 *           minLength: 10
 *           maxLength: 5000
 *           example: "Содержание моего первого поста"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             example: "технологии"
 *     PostUpdate:
 *       allOf:
 *         - $ref: '#/components/schemas/PostCreate'
 *         - type: object
 *           properties: {}
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Создать новый пост
 *     tags: [Posts]
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostCreate'
 *     responses:
 *       201:
 *         description: Пост успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Неавторизованный доступ
 */
router.post(
	'/',
	authenticate,
	validate(postSchema.create),
	postController.createPost
)
/**
 * @swagger
 * /api/posts/search:
 *   get:
 *     summary: Поиск постов
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: "технологии"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Результаты поиска
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Не указан поисковый запрос
 */
router.get(
	'/search',
	validate(postSchema.search),
	postController.searchPosts
)
/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Получить пост по ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "clnjak7xj000008l0a9zq3k4f"
 *     responses:
 *       200:
 *         description: Данные поста
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Пост не найден
 */
router.get('/:id', postController.getPost)
/**
 * @swagger
 * /api/posts/{id}:
 *   patch:
 *     summary: Обновить пост
 *     tags: [Posts]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostUpdate'
 *     responses:
 *       200:
 *         description: Пост успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Неавторизованный доступ
 *       403:
 *         description: Нет прав на редактирование
 */
router.patch(
	'/:id',
	authenticate,
	validate(postSchema.create.partial()),
	postController.updatePost
)
/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Удалить пост
 *     tags: [Posts]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Пост успешно удален
 *       401:
 *         description: Неавторизованный доступ
 *       403:
 *         description: Нет прав на удаление
 */
router.delete('/:id', authenticate, postController.deletePost)
/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Поставить лайк посту
 *     tags: [Posts]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Лайк успешно поставлен
 *       400:
 *         description: Уже лайкнуто
 *       401:
 *         description: Неавторизованный доступ
 */
router.post('/:id/like', authenticate, postController.likePost)
/**
 * @swagger
 * /api/posts/{id}/like:
 *   delete:
 *     summary: Убрать лайк с поста
 *     tags: [Posts]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Лайк успешно убран
 *       400:
 *         description: Лайк не найден
 *       401:
 *         description: Неавторизованный доступ
 */
router.delete('/:id/like', authenticate, postController.unlikePost)
/**
 * @swagger
 * /api/posts/recommended:
 *   get:
 *     summary: Получить рекомендованные посты
 *     tags: [Posts]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Список рекомендованных постов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Неавторизованный доступ
 */
router.get('/recommended', authenticate, postController.getRecommendedPosts)
/**
 * @swagger
 * /api/posts/top:
 *   get:
 *     summary: Получить топ постов
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Список топ постов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/top', postController.getTopPosts)

export default router
