import { Router } from 'express'
import { authenticate } from '../../core/middleware/middleware.js'
import { postController } from './post.controller.js'
import { postSchema } from './post.schema.js'
import { validate } from '../../core/middleware/validation.js'

const router = Router()

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Создать новый пост
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
	validate(postSchema.create, 'body'),
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
router.get('/search', validate(postSchema.search), postController.searchPosts)

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

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Поставить лайк посту
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
 *       - bearerAuth: []
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
 *       - bearerAuth: []
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

export default router
