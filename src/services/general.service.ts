import type { ApiResponse } from '@/types/general.types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/general.types'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'
import { useMutation } from '@tanstack/vue-query'

const authConfig = useAuthConfig()

export const useGetRelationshipsQuery = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery<ApiResponse<string[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['relationships'],
    enabled,
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<string[]>>('/api/user/relationships', {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
  })
}

export const useUpdateTourStageMutation = () => {
  return useMutation<ApiResponse, AxiosError<ValidationErrorResponse>, { stage: number }>({
    mutationFn: async (data: { stage: number }) => {
      const response = await axiosInstance.post<ApiResponse>('/api/user/tour/stage', data, {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
  })
}

export const useSkipTourMutation = () => {
  return useMutation<ApiResponse, AxiosError<ValidationErrorResponse>, void>({
    mutationFn: async () => {
      const response = await axiosInstance.patch<ApiResponse>('/api/user/tour/skip', {
        headers: { Authorization: `Bearer ${authConfig.getToken()}` },
      })
      return response.data
    },
  })
}
