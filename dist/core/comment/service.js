import { prisma } from '../../db.js';
export async function createComment(authorId, postId, data) {
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
    });
}
export async function getPostComments(postId, page = 1, limit = 10) {
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
    });
}
export async function deleteComment(commentId, userId) {
    await prisma.comment.deleteMany({
        where: {
            id: commentId,
            authorId: userId, // Гарантируем, что удалять может только автор
        },
    });
}
