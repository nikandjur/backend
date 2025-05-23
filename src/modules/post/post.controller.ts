// src/modules/post/post.controller.ts
import { NextFunction, Request, Response } from 'express'
import { postService } from '../../core/post/post.service.js'
import { searchService } from '../../core/post/search.service.js'
import { ERRORS } from '../../core/utils/errors.js'
import { logger } from '../../core/services/logger.js'
import { postStats } from '../../core/post/post.stats.js'

export const postController = {
	async createPost(req: Request, res: Response, next: NextFunction) {
		try {
			const { title, content, tags } = req.body
			const post = await postService.createPost(
				req.user.id,
				title,
				content,
				tags
			)
			res.status(201).json(post)
		} catch (err) {
			next(err)
		}
	},

	// Получение поста
	async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.getPostById(req.params.id)
      if (!post) throw ERRORS.notFound('Post not found')
      
      await postStats.view(post.id)
      res.json(post)
    } catch (err) {
      next(err)
    }
  },

	// Обновление поста
	async updatePost(req: Request, res: Response, next: NextFunction) {
		try {
			const post = await postService.updatePost(
				req.params.id,
				req.user.id,
				req.body
			)
			res.json(post)
		} catch (err) {
			next(err)
		}
	},

	// Удаление поста
	async deletePost(req: Request, res: Response, next: NextFunction) {
		try {
			await postService.deletePost(req.params.id, req.user.id)
			res.status(204).end()
		} catch (err) {
			next(err)
		}
	},

	async searchPosts(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.validatedQuery?.q) {
				throw ERRORS.badRequest('Search query is required')
			}
			const results = await searchService.searchPosts(
				req.validatedQuery.q.toString()
			)
			res.json(results)
		} catch (err) {
			next(err)
		}
	},
	// Лайк поста
	async likePost(req: Request, res: Response, next: NextFunction) {
		try {
			await postStats.like(req.params.id, req.user.id)
			res.status(204).end()
		} catch (err) {
			next(err)
		}
	},

	async getRecommendedPosts(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw ERRORS.unauthorized('Authentication required')
			}

			// const posts = await postService.getRecommendedPosts(req.user.id)
			// res.json(posts)
		} catch (err) {
			next(err)
		}
	},
	async getTopPosts(req: Request, res: Response, next: NextFunction) {
		
		try {
			const topPosts = await postService.getTopPosts()
			res.json(topPosts)
		} catch (err) {
			next(err)
		}
	},
}
