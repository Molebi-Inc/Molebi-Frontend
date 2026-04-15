export interface CreateMemoryValues {
  title: string
  description: string
  family_member_ids: number[]
  event_date: string | null
  files: File[]
  metadata: {
    location: string
  }
}

/** Polymorphic type for comment targets (matches API `commentable_type`). */
export type CommentableType = 'storage_media'

/** Polymorphic type for like targets (matches API `likeable_type`). */
export type LikeableType = 'comment' | 'storage_media'

export interface CreateCommentPayload {
  commentable_type: CommentableType
  commentable_id: string
  body: string
}

export interface UpdateCommentPayload {
  body: string
}

export interface CreateLikePayload {
  likeable_type: LikeableType
  likeable_id: string
}

export interface LikeResponse {
  liked: boolean
  likes_count: number
  like: {
    id: number
    likeable_type: string
    likeable_id: number
    user: {
      id: number
      name: string
      avatar_url: string
    }
    created_at: string
  }
}

export interface CommentsListParams {
  commentable_type: CommentableType
  commentable_id: string
}

/** Comment resource from `/api/user/comments` (extend when backend shape is fixed). */
export interface CommentResource {
  id: number
  body: string
  parent_id: number | null
  likes_count: number
  is_liked: boolean
  user: {
    id: number
    name: string
    avatar_url: string
  }
  replies: CommentResource[] | []
  created_at: string
  updated_at: string
}

export interface CommentResponse {
  data: CommentResource[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}
