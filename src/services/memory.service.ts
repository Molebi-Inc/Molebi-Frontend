import { useAuthConfig } from '@/config/auth.config'
import type { StorageFolderInterface } from '@/types/storage.types'
import type {
  CommentResource,
  CommentResponse,
  CommentsListParams,
  CreateCommentPayload,
  CreateLikePayload,
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
