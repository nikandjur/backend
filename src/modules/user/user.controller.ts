import { Request, Response } from 'express'
import { userService } from '../../core/user/service.js'
import { handleError } from '../../core/utils/errorHandler.js'

export const getUserProfile = async (req: Request, res: Response) => {
	try {
		const user = await userService.getUserProfile(req.params.userId)
		res.json(user)
	} catch (err) {
		handleError(res, err)
	}
}

export const updateUserProfile = async (req: Request, res: Response) => {
	try {
		const user = await userService.updateUser(req.user!.id, req.body)
		res.json(user)
	} catch (err) {
		handleError(res, err)
	}
}

export const getUserPosts = async (req: Request, res: Response) => {
	try {
		const { page = 1, limit = 10 } = req.query
		const posts = await userService.getUserPosts(
			req.params.userId,
			Number(page),
			Number(limit)
		)
		res.json(posts)
	} catch (err) {
		handleError(res, err)
	}
}
