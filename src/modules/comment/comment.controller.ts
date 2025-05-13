import { NextFunction, Request, Response } from 'express'
import {
	createComment,
	deleteComment,
	getPostComments,
} from '../../core/comment/service.js'

export async function createCommentController(req: Request, res: Response, next: NextFunction) {
	try {
		const comment = await createComment(
			req.user!.id,
			req.params.postId,
			req.body
		)
		res.status(201).json(comment)
	} catch (err) {
		next(err)
	}
}

export async function getCommentsController(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { page = 1, limit = 10 } = req.query
		const comments = await getPostComments(
			req.params.postId,
			Number(page),
			Number(limit)
		)
		res.json(comments)
	} catch (err) {
		next(err)
	}
}

export async function deleteCommentController(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		await deleteComment(req.params.id, req.user!.id)
		res.status(204).send()
	} catch (err) {
		next(err)
	}
}
