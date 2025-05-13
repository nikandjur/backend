import { Router } from 'express'
import { authenticate } from '../../core/auth/middleware.js'
import { validate } from '../../core/utils/validation.js'
import {
	createCommentController,
	getCommentsController,
	deleteCommentController,
} from './comment.controller.js'
import {
	createCommentSchema,
	commentParamsSchema,
	commentIdSchema,
} from './comment.schema.js'

const router = Router()

router.post(
	'/posts/:postId/comments',
	authenticate,
	validate(commentParamsSchema, 'params'),
	validate(createCommentSchema),
	createCommentController
)

router.get(
	'/posts/:postId/comments',
	validate(commentParamsSchema, 'params'),
	getCommentsController
)

router.delete(
	'/comments/:id',
	authenticate,
	validate(commentIdSchema, 'params'),
	deleteCommentController
)

export default router
