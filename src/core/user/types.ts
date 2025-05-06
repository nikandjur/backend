
export type UserProfile = {
	id: string
	name: string | null // Разрешаем null
	email: string
	avatarUrl?: string | null
	bio?: string | null
	website?: string | null
	emailVerified?: Date | null
	_count?: {
		posts: number
	}
}

export type PostPreview = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export type UserPreview = {
  id: string
  name: string
  avatarUrl?: string | null
}

interface SessionData {
	userId: string
	role: string
	ip?: string
	country?: string
}