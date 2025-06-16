import { Router } from 'express'
import { authenticate } from '../../core/middleware/middleware.js'
import { validate } from '../../core/middleware/validation.js'
import {
	handleConfirmAvatar,
	handleDeleteAvatar,
	handleGenerateAvatarUrl,
	handleGetMediaFile,
} from './storage.controller.js'
import { avatarConfirmSchema } from './storage.schema.js'

const router = Router()

/**
 * @swagger
 * /api/avatar/upload-url:
 *   post:
 *     summary: Получить временную ссылку для загрузки аватара
 *     description: Генерирует временную подписанную ссылку для загрузки изображения аватара через MinIO
 *     tags: [Avatar]
 *     operationId: generateAvatarUploadUrl
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Временная ссылка для загрузки аватара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadUrlResponse'
 *       401:
 *         description: Неавторизованный доступ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
router.post('/avatar/upload-url', authenticate, handleGenerateAvatarUrl)

/**
 * @swagger
 * /api/avatar/confirm:
 *   post:
 *     summary: Подтвердить загрузку аватара
 *     description: Подтверждает успешную загрузку аватара по ключу объекта в MinIO
 *     tags: [Avatar]
 *     operationId: confirmAvatarUpload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Ключ объекта (ключ файла в хранилище)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvatarConfirmRequest'
 *     responses:
 *       '200':
 *         description: Аватар успешно загружен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvatarConfirmResponse'
 *       401:
 *         description: Неавторизованный доступ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
router.post(
	'/avatar/confirm',
	authenticate,
	validate(avatarConfirmSchema, 'body'),
	handleConfirmAvatar
)

/**
 * @swagger
 * /api/avatar:
 *   delete:
 *     summary: Удалить текущий аватар пользователя
 *     description: Удаляет аватар пользователя из хранилища и очищает ссылку в БД
 *     tags: [Avatar]
 *     operationId: deleteAvatar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Аватар успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvatarConfirmResponse'
 *       401:
 *         description: Неавторизованный доступ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
router.delete('/avatar', authenticate, handleDeleteAvatar)

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: Get file from storage
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "avatars/user123.webp"
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/media', handleGetMediaFile);

export default router
