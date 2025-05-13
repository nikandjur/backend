import { prisma } from '../../db.js'
import { CommentCreateData, CommentWithAuthor } from './types.js'

export async function createComment(
	authorId: string,
	postId: string,
	data: CommentCreateData
): Promise<CommentWithAuthor> {
	return prisma.comment.create({
		data: {
			...data,
			postId,
			authorId,
		},
		include: {
			author: {
				select: { id: true, name: true, avatarUrl: true },
			},
		},
	})
}

export async function getPostComments(
	postId: string,
	page: number = 1,
	limit: number = 10
): Promise<CommentWithAuthor[]> {
	return prisma.comment.findMany({
		where: { postId },
		skip: (page - 1) * limit,
		take: limit,
		orderBy: { createdAt: 'desc' },
		include: {
			author: {
				select: { id: true, name: true, avatarUrl: true },
			},
		},
	})
}

export async function deleteComment(
	commentId: string,
	userId: string
): Promise<void> {
	await prisma.comment.deleteMany({
		where: {
			id: commentId,
			authorId: userId, // Гарантируем, что удалять может только автор
		},
	})
}
