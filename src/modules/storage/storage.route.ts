import { Router } from 'express'
import { authenticate } from '../../core/auth/middleware.js'
import { validate } from '../../core/utils/validation.js'
import { avatarConfirmSchema, fileUploadSchema } from './storage.schema.js'
import {
	handleConfirmAvatar,
	handleGenerateAvatarUrl,
	handleGenerateUploadUrl,
} from './storage.controller.js'

const router = Router()

// Аватары
router.post('/avatar/upload-url', authenticate, handleGenerateAvatarUrl)
router.post(
	'/avatar/confirm',
	authenticate,
	validate(avatarConfirmSchema),
	handleConfirmAvatar
)

// Общие загрузки
router.post(
	'/upload-url',
	authenticate,
	validate(fileUploadSchema),
	handleGenerateUploadUrl
)

export default router
