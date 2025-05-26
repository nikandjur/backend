import { Post } from '@prisma/client'

// Убираем дублирующие поля, используем существующие из Prisma
export interface PostWithStats extends Omit<Post, 'likesCount' | 'views'> {
	likes: number // Переименовываем likesCount в более простое likes
	views: number // Оставляем views как есть
	author: {
		id: string
		name: string | null
		avatarUrl: string | null
	}
}

export type ActivityJob =
	| { type: 'like'; postId: string; userId: string }
	| { type: 'view'; postId: string }
