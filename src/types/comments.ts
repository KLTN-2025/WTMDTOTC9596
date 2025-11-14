export type ProductComment = {
  id: string
  productId: string
  userId: string
  content: string
  parentId: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    fullName: string | null
    avatarUrl: string | null
  }
  replies?: ProductComment[]
}

export type CreateCommentData = {
  productId: string
  content: string
  parentId?: string | null
}

export type UpdateCommentData = {
  content: string
}

export type ProductReaction = {
  id: string
  productId: string
  userId: string
  reactionType: 'happy' | 'love' | 'surprised' | 'sad' | 'angry'
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    fullName: string | null
    avatarUrl: string | null
  }
}

export type ReactionType = 'happy' | 'love' | 'surprised' | 'sad' | 'angry'

export type ReactionStats = {
  happy: number
  love: number
  surprised: number
  sad: number
  angry: number
  userReaction: ReactionType | null
}

