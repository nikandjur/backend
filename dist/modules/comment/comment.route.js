import { Router } from 'express';
import { authenticate } from '../../core/middleware/middleware.js';
import { createCommentController, deleteCommentController, getCommentsController, } from './comment.controller.js';
import { commentIdSchema, commentParamsSchema, createCommentSchema, } from './comment.schema.js';
import { validate } from '../../core/middleware/validation.js';
const router = Router();
/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Создать новый комментарий
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID поста
 *     requestBody:
 *       required: true
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
 *         description: Ошибка валидации
 *       401:
 *         description: Неавторизованный доступ
 */
router.post('/posts/:postId/comments', authenticate, validate(commentParamsSchema, 'params'), validate(createCommentSchema, 'body'), createCommentController);
/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: Получить комментарии к посту
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID поста
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
 */
router.get('/posts/:postId/comments', validate(commentParamsSchema, 'params'), getCommentsController);
/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Удалить комментарий
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID комментария
 *     responses:
 *       204:
 *         description: Комментарий успешно удален
 *         content: {}
 *       401:
 *         description: Неавторизованный доступ
 *       403:
 *         description: Нет прав на удаление
 *       404:
 *         description: Комментарий не найден
 */
router.delete('/comments/:id', authenticate, validate(commentIdSchema, 'params'), deleteCommentController);
export default router;
