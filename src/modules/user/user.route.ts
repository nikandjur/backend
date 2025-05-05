// src/modules/user/user.route.ts
import { Router } from 'express'
import { authenticate } from '../../core/auth/middleware.js'
import { validate } from '../../core/utils/validation.js'
import {
	getUserProfile,
	updateUserProfile,
	getUserPosts,

} from './user.controller.js'
import {
	profileUpdateSchema,
	userIdParamsSchema,
	paginationSchema,
} from './user.schema.js'

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
