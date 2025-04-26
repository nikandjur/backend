import { Router } from 'express'
import {
	verifyEmailHandler, // Переименовываем обработчик
	generateAvatarUrl,
	confirmAvatar,
} from './user.controller'
import { authenticate } from '../../core/auth/middleware.js'
import { avatarConfirmSchema, emailVerificationSchema } from './user.schema.js'
import { validate } from '../../core/utils/validation.js'

const router = Router()

router.get(
	'/verify-email',
	validate(emailVerificationSchema), // Теперь без второго параметра
	verifyEmailHandler // Используем переименованный обработчик
)

router.post('/avatar/upload-url', authenticate, generateAvatarUrl)

router.post(
	'/avatar/confirm',
	authenticate,
	validate(avatarConfirmSchema),
	confirmAvatar
)

export default router
