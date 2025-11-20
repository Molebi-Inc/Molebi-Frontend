import { useAuthConfig } from '@/config/auth.config'
import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type { AxiosError } from 'axios'
import type { TreeSettings, PrivacySettings, NotificationSettings } from '@/types/settings.types'
import type { ChangePasswordValues, ChangeVaultPinValues } from '@/types/settings.types'

const authConfig = useAuthConfig()

export const useDeleteProfileMutation = () => {
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, void>({
    mutationFn: async () => {
      const response = await axiosInstance.delete<ApiResponse<void>>('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
  })
}

export const useSignOutMutation = () => {
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, void>({
    mutationFn: async () => {
      const response = await axiosInstance.post<ApiResponse<void>>('/api/user/auth/logout', {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
  })
}

export const useUpdateProfileAvatarMutation = () => {
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, File | null>({
    mutationFn: async (file: File | null) => {
      const formData = new FormData()
      formData.append('avatar', file ?? '')
      formData.append('_method', 'PUT')
      const response = await axiosInstance.post<ApiResponse<void>>('/api/user/profile', formData, {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
  })
}

export const useUpdateTreeSettingsMutation = () => {
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, TreeSettings>({
    mutationFn: async (data: TreeSettings) => {
      const response = await axiosInstance.patch<ApiResponse<void>>(
        '/api/user/profile/tree-settings',
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

export const useUpdatePrivacySettingsMutation = () => {
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, PrivacySettings>({
    mutationFn: async (data: PrivacySettings) => {
      const response = await axiosInstance.patch<ApiResponse<void>>(
        '/api/user/profile/privacy-settings',
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

export const useUpdateNotificationSettingsMutation = () => {
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, NotificationSettings>({
    mutationFn: async (data: NotificationSettings) => {
      const response = await axiosInstance.patch<ApiResponse<void>>(
        '/api/user/profile/notification-settings',
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

export const useGetSettingsMutation = () => {
  return useQuery<ApiResponse, AxiosError<ValidationErrorResponse>>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse>('/api/user/profile/settings', {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
    retry: false,
  })
}

export const useChangePasswordMutation = () => {
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, ChangePasswordValues>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        '/api/user/auth/change-password',
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

export const useChangeVaultPinMutation = () => {
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, ChangeVaultPinValues>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        '/api/user/vault/change-pin',
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
