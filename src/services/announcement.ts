import { useAuthConfig } from '@/config/auth.config'
import axiosInstance from '@/config/axios.config'
import { useMutation, useQuery } from '@tanstack/vue-query'
import type { ApiResponse } from '@/types/general.types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/general.types'
import type { Announcement, AnnouncementFormValues } from '@/types/announcement.types'
import type { MaybeRef } from 'vue'
import { toValue } from 'vue'

const authConfig = useAuthConfig()

export const useGetAnnouncementsQuery = (params: MaybeRef<{ page: number; per_page: number }>) => {
  return useQuery<ApiResponse<{ data: Announcement[] }>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['announcements', params],
    queryFn: async () => {
      const paramsValue = toValue(params)
      const response = await axiosInstance.get<ApiResponse<{ data: Announcement[] }>>(
        '/api/user/announcements',
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

export const useGetAnnouncementByIdQuery = (id: string) => {
  return useQuery<ApiResponse<Announcement>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Announcement>>(
        `/api/user/announcements/${id}`,
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

export const useAddAnnouncementMutation = () => {
  return useMutation<
    ApiResponse<Announcement>,
    AxiosError<ValidationErrorResponse>,
    AnnouncementFormValues
  >({
    mutationFn: async (data: AnnouncementFormValues) => {
      const response = await axiosInstance.post<ApiResponse<Announcement>>(
        '/api/user/announcements',
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

export const useUpdateAnnouncementMutation = () => {
  return useMutation<
    ApiResponse<Announcement>,
    AxiosError<ValidationErrorResponse>,
    { id: number; data: AnnouncementFormValues }
  >({
    mutationFn: async ({ id, data }: { id: number; data: AnnouncementFormValues }) => {
      const response = await axiosInstance.post<ApiResponse<Announcement>>(
        `/api/user/announcements/${id}`,
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

export const useDeleteAnnouncementMutation = () => {
  return useMutation<ApiResponse<Announcement>, AxiosError<ValidationErrorResponse>, number>({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete<ApiResponse<Announcement>>(
        `/api/user/announcements/${id}`,
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
