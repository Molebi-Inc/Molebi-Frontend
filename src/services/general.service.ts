import type { AxiosError } from 'axios'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useMutation } from '@tanstack/vue-query'
import { useAuthConfig } from '@/config/auth.config'
import type { ValidationErrorResponse } from '@/types/general.types'
import type { ApiResponse, StateInterface } from '@/types/general.types'
import type { TourStageInterface, TourUpdateTypeInterface } from '@/types/tour.types'

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
      const response = await axiosInstance.patch<ApiResponse>(
        '/api/user/tour/skip',
        {},
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useGetStatesQuery = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery<ApiResponse<StateInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['states'],
    enabled,
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<StateInterface[]>>('/api/user/states', {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
  })
}

export const useGetTourStagesQuery = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery<ApiResponse<TourStageInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['tour-stages'],
    enabled,
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<TourStageInterface[]>>(
        '/api/user/tour/stages',
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useUpdateTourStagesMutation = () => {
  return useMutation<
    ApiResponse<TourStageInterface[]>,
    AxiosError<ValidationErrorResponse>,
    TourUpdateTypeInterface
  >({
    mutationFn: async (data: TourUpdateTypeInterface) => {
      const response = await axiosInstance.post<ApiResponse<TourStageInterface[]>>(
        '/api/user/tour/stages',
        data,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

// export const useNotificationQuery = ({ enabled = true }: { enabled?: boolean } = {}) => {
//   return useQuery<ApiResponse<NotificationTypeInterface[]>, AxiosError<ValidationErrorResponse>>({
//     queryKey: ['notifications'],
//     enabled,
//     queryFn: async () => {
//       const response = await axiosInstance.get<ApiResponse<NotificationInterface[]>>(
//         '/api/user/notifications',
//         {
//           headers: {
//             Authorization: `Bearer ${authConfig.getToken()}`,
//           },
//         },
//       )
//       return response.data
//     },
//   })
// }
