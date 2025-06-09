import { Router } from 'express'
import { authenticate } from '../../core/middleware/middleware.js'
import {
	createCommentController,
	deleteCommentController,
	getCommentsController,
} from './comment.controller.js'
import {
	commentIdSchema,
	commentParamsSchema,
	createCommentSchema,
} from './comment.schema.js'
import { validate } from '../../core/middleware/validation.js'

const router = Router()

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Создать новый комментарий
 *     description: Добавляет комментарий к указанному посту от имени авторизованного пользователя
 *     tags: [Comments]
 *     operationId: createComment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор поста, к которому добавляется комментарий
 *     requestBody:
 *       required: true
 *       description: Текст комментария
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreate'
 *     responses:
 *       201:
 *         description: Комментарий успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
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
	'/posts/:postId/comments',
	authenticate,
	validate(commentParamsSchema, 'params'),
	validate(createCommentSchema, 'body'),
	createCommentController
)

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: Получить комментарии к посту
 *     description: Возвращает список всех комментариев, связанных с указанным постом
 *     tags: [Comments]
 *     operationId: getPostComments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор поста
 *     responses:
 *       200:
 *         description: Список комментариев
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Пост не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
router.get(
	'/posts/:postId/comments',
	validate(commentParamsSchema, 'params'),
	getCommentsController
)

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Удалить комментарий
 *     description: Удаляет комментарий по его ID, если у пользователя есть на это права
 *     tags: [Comments]
 *     operationId: deleteComment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор комментария
 *     responses:
 *       204:
 *         description: Комментарий успешно удален
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
 *         description: Комментарий не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
router.delete(
	'/comments/:id',
	authenticate,
	validate(commentIdSchema, 'params'),
	deleteCommentController
)

export default router
