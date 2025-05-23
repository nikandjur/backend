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
