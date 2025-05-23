import { Post, Tag } from '@prisma/client'

export type PostWithStats = Post & {
	likesCount: number
	views: number
	tags: Tag[]
}

export type ActivityJob =
	| { type: 'like'; postId: string; userId: string }
	// | { type: 'unlike'; postId: string; userId: string }
	| { type: 'view'; postId: string }
