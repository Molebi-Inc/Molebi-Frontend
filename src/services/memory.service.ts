import { useAuthConfig } from '@/config/auth.config'
import type { StorageFolderInterface } from '@/types/storage.types'
import type {
  CommentResource,
  CommentResponse,
  CommentsListParams,
  CreateCommentPayload,
  CreateLikePayload,
  LikeableType,
  LikeListRecord,
  LikeResponse,
  UpdateCommentPayload,
} from '@/types/memory.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type { AxiosError } from 'axios'
import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { toValue, type MaybeRefOrGetter } from 'vue'

const authConfig = useAuthConfig()

export const useCreateMemoryMutation = () => {
  const createMemoryMutation = useMutation<
    ApiResponse<StorageFolderInterface>,
    AxiosError<ValidationErrorResponse>,
    { formData: FormData; id: number }
  >({
    mutationFn: async ({ formData, id }: { formData: FormData; id: number }) => {
      const response = await axiosInstance.post<ApiResponse<StorageFolderInterface>>(
        `/api/user/storage/folders/${id}/media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      return response.data
    },
  })
  return createMemoryMutation
}

/** POST /api/user/comments — create a top-level comment on a commentable. */
export const useCreateCommentMutation = () => {
  return useMutation<
    ApiResponse<CommentResource>,
    AxiosError<ValidationErrorResponse>,
    CreateCommentPayload
  >({
    mutationFn: async (payload: CreateCommentPayload) => {
      const response = await axiosInstance.post<ApiResponse<CommentResource>>(
        '/api/user/comments',
        payload,
        { headers: { Authorization: `Bearer ${authConfig.getToken()}` } },
      )
      return response.data
    },
  })
}

/** GET /api/user/comments — list comments for a commentable. */
export const useCommentsQuery = (
  params: MaybeRefOrGetter<CommentsListParams | null>,
  enabled: MaybeRefOrGetter<boolean> = true,
) => {
  return useQuery<ApiResponse<CommentResponse>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['comments', params],
    queryFn: async () => {
      const p = toValue(params)
      if (!p) {
        throw new Error('Comments query requires commentable_type and commentable_id')
      }
      const response = await axiosInstance.get<ApiResponse<CommentResponse>>('/api/user/comments', {
        params: {
          commentable_type: p.commentable_type,
          commentable_id: p.commentable_id,
        },
        headers: { Authorization: `Bearer ${authConfig.getToken()}` },
      })
      return response.data
    },
    enabled: () => Boolean(toValue(enabled) && toValue(params)),
  })
}

/** POST /api/user/comments/:id/replies — reply to an existing comment. */
export const useCreateCommentReplyMutation = () => {
  return useMutation<
    ApiResponse<CommentResource>,
    AxiosError<ValidationErrorResponse>,
    { commentId: number; payload: CreateCommentPayload }
  >({
    mutationFn: async ({ commentId, payload }) => {
      const response = await axiosInstance.post<ApiResponse<CommentResource>>(
        `/api/user/comments/${commentId}/replies`,
        payload,
        { headers: { Authorization: `Bearer ${authConfig.getToken()}` } },
      )
      return response.data
    },
  })
}

/** PUT /api/user/comments/:id — update comment body. */
export const useUpdateCommentMutation = () => {
  return useMutation<
    ApiResponse<CommentResource>,
    AxiosError<ValidationErrorResponse>,
    { commentId: number; payload: UpdateCommentPayload }
  >({
    mutationFn: async ({ commentId, payload }) => {
      const response = await axiosInstance.put<ApiResponse<CommentResource>>(
        `/api/user/comments/${commentId}`,
        payload,
        { headers: { Authorization: `Bearer ${authConfig.getToken()}` } },
      )
      return response.data
    },
  })
}

/** DELETE /api/user/comments/:id */
export const useDeleteCommentMutation = () => {
  return useMutation<ApiResponse, AxiosError<ValidationErrorResponse>, { commentId: number }>({
    mutationFn: async ({ commentId }) => {
      const response = await axiosInstance.delete<ApiResponse>(`/api/user/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${authConfig.getToken()}` },
      })
      return response.data
    },
  })
}

/** POST /api/user/likes — toggle/record a like on a comment or storage media. */
export const useToggleLikeMutation = () => {
  return useMutation<
    ApiResponse<LikeResponse>,
    AxiosError<ValidationErrorResponse>,
    CreateLikePayload
  >({
    mutationFn: async (payload: CreateLikePayload) => {
      const response = await axiosInstance.post<ApiResponse<LikeResponse>>(
        '/api/user/likes',
        payload,
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
  })
}

export const useGetLikeQuery = (likeable_type: LikeableType, likeable_id: number) => {
  return useQuery<ApiResponse<LikeResponse[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['like', likeable_type, likeable_id],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<LikeResponse[]>>(
        `/api/user/likes?likeable_type=${likeable_type}&likeable_id=${likeable_id}`,
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
  })
}

export interface AnnouncementEngagement {
  comments_count: number
  likes_count: number
  is_liked: boolean
}

function commentTotalFromApiBody(body: ApiResponse<CommentResponse>): number {
  const inner = body.data
  if (!inner) return 0
  if (Array.isArray(inner)) return inner.length
  if (typeof inner !== 'object') return 0
  if (inner.meta && typeof inner.meta.total === 'number') return inner.meta.total
  if (Array.isArray(inner.data)) return inner.data.length
  return 0
}

/**
 * Loads comment count (via paginated meta when available) and likes for one announcement.
 * `is_liked` is true when `currentUserId` matches a like's `user.id`.
 */
export async function fetchAnnouncementEngagement(
  announcementId: number,
  currentUserId?: number | null,
): Promise<AnnouncementEngagement> {
  const headers = { Authorization: `Bearer ${authConfig.getToken()}` }

  const [commentsRes, likesRes] = await Promise.all([
    axiosInstance.get<ApiResponse<CommentResponse>>('/api/user/comments', {
      params: {
        commentable_type: 'announcement',
        commentable_id: String(announcementId),
        page: 1,
        per_page: 1,
      },
      headers,
    }),
    axiosInstance.get<ApiResponse<LikeListRecord[] | LikeResponse>>(
      `/api/user/likes?likeable_type=announcement&likeable_id=${announcementId}`,
      { headers },
    ),
  ])

  const comments_count = commentTotalFromApiBody(commentsRes.data)

  const likesPayload = likesRes.data.data
  let likes_count = 0
  let is_liked = false

  if (Array.isArray(likesPayload)) {
    likes_count = likesPayload.length
    if (currentUserId != null) {
      is_liked = likesPayload.some((row) => row.user?.id === currentUserId)
    }
  } else if (
    likesPayload &&
    typeof likesPayload === 'object' &&
    'likes_count' in likesPayload &&
    typeof (likesPayload as LikeResponse).likes_count === 'number'
  ) {
    const agg = likesPayload as LikeResponse
    likes_count = agg.likes_count
    is_liked = Boolean(agg.liked)
  }

  return { comments_count, likes_count, is_liked }
}
