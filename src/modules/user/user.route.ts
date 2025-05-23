// src/modules/user/user.route.ts
import { Router } from 'express'
import { authenticate } from '../../core/middleware/middleware.js'
import {
	getUserPosts,
	getUserProfile,
	updateUserProfile,
} from './user.controller.js'
import {
	paginationSchema,
	profileUpdateSchema,
	userIdParamsSchema,
} from './user.schema.js'
import { validate } from '../../core/middleware/validation.js'

const router = Router()

// Профиль пользователя
router.get('/:userId', validate(userIdParamsSchema, 'params'), getUserProfile)
router.put(
	'/profile',
	authenticate,
	validate(profileUpdateSchema),
	updateUserProfile
)

// Контент
router.get(
	'/:userId/posts',
	validate(userIdParamsSchema, 'params'),
	validate(paginationSchema, 'query'),
	getUserPosts
)

export default router
