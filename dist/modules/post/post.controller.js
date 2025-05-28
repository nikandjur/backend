import { postService } from '../../core/post/post.service.js';
import { searchService } from '../../core/post/posts.search.js';
import { ERRORS } from '../../core/utils/errors.js';
import { postStats } from '../../core/post/post.stats.js';
export const postController = {
    async createPost(req, res, next) {
        try {
            const { title, content } = req.body;
            const post = await postService.createPost(req.user.id, title, content);
            res.status(201).json(post);
        }
        catch (err) {
            next(err);
        }
    },
    // Получение поста
    async getPost(req, res, next) {
        try {
            const post = await postService.getPostById(req.params.id);
            if (!post)
                throw ERRORS.notFound('Post not found');
            await postStats.view(post.id);
            res.json(post);
        }
        catch (err) {
            next(err);
        }
    },
    // Обновление поста
    async updatePost(req, res, next) {
        try {
            const post = await postService.updatePost(req.params.id, req.user.id, req.body);
            res.json(post);
        }
        catch (err) {
            next(err);
        }
    },
    // Удаление поста
    async deletePost(req, res, next) {
        try {
            await postService.deletePost(req.params.id, req.user.id);
            res.status(204).end();
        }
        catch (err) {
            next(err);
        }
    },
    async searchPosts(req, res, next) {
        try {
            if (!req.validatedQuery?.q) {
                throw ERRORS.badRequest('Search query is required');
            }
            const results = await searchService.searchPosts(req.validatedQuery.q.toString());
            res.json(results);
        }
        catch (err) {
            next(err);
        }
    },
    // Лайк поста
    async likePost(req, res, next) {
        try {
            await postStats.like(req.params.id, req.user.id);
            res.status(204).end();
        }
        catch (err) {
            next(err);
        }
    },
    async getTopPosts(req, res, next) {
        try {
            const topPosts = await postService.getTopPosts();
            res.json(topPosts);
        }
        catch (err) {
            next(err);
        }
    },
};
