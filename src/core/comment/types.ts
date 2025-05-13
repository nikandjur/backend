export type CommentCreateData = {
	text: string
}

export type CommentWithAuthor = {
	id: string
	text: string
	createdAt: Date
	updatedAt: Date
	postId: string
	author: {
		id: string
		name: string | null
		avatarUrl: string | null
	}
}
