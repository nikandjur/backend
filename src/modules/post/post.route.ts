import { Router } from 'express'

import { postController } from './post.controller.js'
import { postSchema } from './post.schema.js'
import { validate } from '../../core/middleware/validation.js'
import { authenticate } from '../../core/middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Создать новый пост
 *     description: Авторизованный пользователь создаёт новый пост с заголовком, контентом и тегами
 *     tags: [Posts]
 *     operationId: createPost
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Данные нового поста
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
 *     summary: Поиск постов по тексту
 *     description: Выполняет поиск постов по заданному запросу
 *     tags: [Posts]
 *     operationId: searchPosts
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: "технологии"
 *         description: Поисковый запрос
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Максимальное количество результатов
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение от начала выборки
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
 *         description: Не указан поисковой запрос
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidation'
 */
router.get('/search', validate(postSchema.search), postController.searchPosts)

/**
 * @swagger
 * /api/posts/top:
 *   get:
 *     summary: Получить топ постов
 *     description: Возвращает список наиболее популярных (топовых) постов
 *     tags: [Posts]
 *     operationId: getTopPosts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество возвращаемых постов
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
 *     description: Авторизованный пользователь ставит лайк указанному посту
 *     tags: [Posts]
 *     operationId: likePost
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор поста, которому ставится лайк
 *     responses:
 *       204:
 *         description: Лайк успешно поставлен
 *       400:
 *         description: Пользователь уже поставил лайк
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       401:
 *         description: Неавторизованный доступ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
router.post('/:id/like', authenticate, postController.likePost)

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Получить пост по ID
 *     description: Возвращает данные конкретного поста по его идентификатору
 *     tags: [Posts]
 *     operationId: getPostById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "clnjak7xj000008l0a9zq3k4f"
 *         description: Идентификатор поста
 *     responses:
 *       200:
 *         description: Данные поста
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Пост не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
router.get('/:id', postController.getPost)

/**
 * @swagger
 * /api/posts/{id}:
 *   patch:
 *     summary: Обновить пост
 *     description: Обновляет данные существующего поста, если у пользователя есть права на редактирование
 *     tags: [Posts]
 *     operationId: updatePost
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор поста
 *     requestBody:
 *       required: true
 *       description: Новые данные поста
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
 *       403:
 *         description: Нет прав на редактирование
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
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
 *     description: Удаляет пост по его ID, если у пользователя есть права на удаление
 *     tags: [Posts]
 *     operationId: deletePost
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор поста
 *     responses:
 *       204:
 *         description: Пост успешно удален
 *         content: {}
 *       401:
 *         description: Неавторизованный доступ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: Нет прав на удаление
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       404:
 *         description: Пост не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
router.delete('/:id', authenticate, postController.deletePost)

export default router
