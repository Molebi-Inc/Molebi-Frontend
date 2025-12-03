import { useAuthConfig } from '@/config/auth.config'
import type { ApiResponse, PaginationParams, ValidationErrorResponse } from '@/types/general.types'
import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import type { FamilyTraditionFormValues } from '@/types/family-tradition.types'
import type { AxiosError } from 'axios'
import type { FamilyTradition, FamilyTraditionTab } from '@/types/family-tradition.types'
import type { MaybeRef } from 'vue'
import { toValue } from 'vue'

const authConfig = useAuthConfig()

export const useAddFamilyTraditionMutation = () => {
  return useMutation<
    ApiResponse<FamilyTradition>,
    AxiosError<ValidationErrorResponse>,
    FamilyTraditionFormValues
  >({
    mutationFn: async (data: FamilyTraditionFormValues) => {
      const response = await axiosInstance.post<ApiResponse<FamilyTradition>>(
        '/api/user/traditions',
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

export const useUpdateFamilyTraditionMutation = () => {
  return useMutation<
    ApiResponse<FamilyTradition>,
    AxiosError<ValidationErrorResponse>,
    { id: number; data: FamilyTraditionFormValues }
  >({
    mutationFn: async ({ id, data }: { id: number; data: FamilyTraditionFormValues }) => {
      const response = await axiosInstance.post<ApiResponse<FamilyTradition>>(
        `/api/user/traditions/${id}`,
        { ...data, _method: 'PUT' },
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

export const useDeleteFamilyTraditionMutation = () => {
  return useMutation<
    ApiResponse<FamilyTradition>,
    AxiosError<ValidationErrorResponse>,
    { id: number }
  >({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await axiosInstance.delete<ApiResponse<FamilyTradition>>(
        `/api/user/traditions/${id}`,
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

export const useGetFamilyTraditionsQuery = (
  params: MaybeRef<PaginationParams>,
  path: MaybeRef<FamilyTraditionTab>,
  enabled?: boolean,
) => {
  return useQuery<ApiResponse<FamilyTradition[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['family-traditions', params, path],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<FamilyTradition[]>>(
        `/api/user/traditions/${toValue(path).toLowerCase()}`,
        {
          params: toValue(params),
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

// this takes either id or string of upcoming & past. So it can return object or array of objects
export const useGetFamilyTraditionByPathQuery = (path: string) => {
  return useQuery<
    ApiResponse<FamilyTradition | FamilyTradition[]>,
    AxiosError<ValidationErrorResponse>
  >({
    queryKey: ['family-tradition', path],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<FamilyTradition>>(
        `/api/user/traditions/${path}`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: !!path,
  })
}
