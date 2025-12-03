import type { MaybeRef } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type {
  TimeCapsuleRequestParams,
  TimeCapsuleInterface,
  TimeCapsuleFormValues,
} from '@/types/time-capsule.types'
import { toValue } from 'vue'
import type { AxiosError } from 'axios'

const authConfig = useAuthConfig()

export const useGetTimeCapsulesQuery = (params?: MaybeRef<TimeCapsuleRequestParams>) => {
  return useQuery<ApiResponse<TimeCapsuleInterface[]>>({
    queryKey: ['time-capsules', params],
    queryFn: async () => {
      const paramsValue = toValue(params)
      const response = await axiosInstance.get<ApiResponse<TimeCapsuleInterface[]>>(
        '/api/user/time-capsules',
        {
          params: paramsValue,
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useCreateTimeCapsuleMutation = () => {
  return useMutation<
    ApiResponse<TimeCapsuleInterface>,
    AxiosError<ValidationErrorResponse>,
    TimeCapsuleFormValues
  >({
    mutationFn: async (data: TimeCapsuleFormValues) => {
      const response = await axiosInstance.post<ApiResponse<TimeCapsuleInterface>>(
        '/api/user/time-capsules',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useGetTimeCapsuleByIdQuery = (id?: number, enabled?: boolean) => {
  return useQuery<ApiResponse<TimeCapsuleInterface>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['time-capsule', id],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<TimeCapsuleInterface>>(
        `/api/user/time-capsules/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: enabled ?? true,
  })
}

export const useUpdateTimeCapsuleMutation = () => {
  return useMutation<
    ApiResponse<TimeCapsuleInterface>,
    AxiosError<ValidationErrorResponse>,
    TimeCapsuleFormValues & { id: number }
  >({
    mutationFn: async (data: TimeCapsuleFormValues & { id: number }) => {
      const response = await axiosInstance.put<ApiResponse<TimeCapsuleInterface>>(
        `/api/user/time-capsules/${data.id}`,
        {
          ...data,
          _method: 'PUT',
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useDeleteTimeCapsuleMutation = () => {
  return useMutation<
    ApiResponse<TimeCapsuleInterface>,
    AxiosError<ValidationErrorResponse>,
    number
  >({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete<ApiResponse<TimeCapsuleInterface>>(
        `/api/user/time-capsules/${id}`,
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
