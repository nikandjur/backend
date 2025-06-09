import { Router } from 'express'
import { authenticate } from '../../core/middleware/middleware.js'
import {
	handleConfirmAvatar,
	handleGenerateAvatarUrl,
	handleGenerateUploadUrl,
} from './storage.controller.js'
import { avatarConfirmSchema, fileUploadSchema } from './storage.schema.js'
import { validate } from '../../core/middleware/validation.js'

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
	validate(avatarConfirmSchema),
	handleConfirmAvatar
)

/**
 * @swagger
 * /api/upload-url:
 *   post:
 *     summary: Получить временную ссылку для загрузки файла
 *     description: Генерирует временную подписанную ссылку для загрузки произвольного файла через MinIO
 *     tags: [Avatar]
 *     operationId: generateFileUploadUrl
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Имя файла и MIME-тип
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FileUploadRequest'
 *     responses:
 *       '200':
 *         description: Временная ссылка для загрузки
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
router.post(
	'/upload-url',
	authenticate,
	validate(fileUploadSchema),
	handleGenerateUploadUrl
)

export default router
