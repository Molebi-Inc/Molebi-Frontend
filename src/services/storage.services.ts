import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'
import type { AttachmentInterface, CreateFolderValues } from '@/types/vault.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { AxiosError } from 'axios'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { FamilyMediaFormValues } from '@/types/family-tradition.types'

const authConfig = useAuthConfig()

export const useCreateFolderMutation = () => {
  const createFolderMutation = useMutation<
    ApiResponse<StorageFolderInterface>,
    AxiosError<ValidationErrorResponse>,
    CreateFolderValues
  >({
    mutationFn: async (folder: CreateFolderValues) => {
      const response = await axiosInstance.post<ApiResponse<StorageFolderInterface>>(
        '/api/user/storage/folders',
        folder,
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
  })
  return createFolderMutation
}

export const useUpdateFolderMutation = () => {
  const updateFolderMutation = useMutation<
    ApiResponse<StorageFolderInterface>,
    AxiosError<ValidationErrorResponse>,
    { folder: CreateFolderValues; id: number }
  >({
    mutationFn: async ({ folder, id }: { folder: CreateFolderValues; id: number }) => {
      const response = await axiosInstance.put<ApiResponse<StorageFolderInterface>>(
        `/api/user/storage/folders/${id}`,
        folder,
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
  })
  return updateFolderMutation
}

export const useDeleteFolderMutation = () => {
  return useMutation<ApiResponse, AxiosError<ValidationErrorResponse>, { id: number }>({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await axiosInstance.delete<ApiResponse>(`/api/user/storage/folders/${id}`, {
        headers: { Authorization: `Bearer ${authConfig.getToken()}` },
      })
      return response.data
    },
  })
}

export const useGetStorageFoldersQuery = (enabled: MaybeRefOrGetter<boolean> = true) => {
  return useQuery<ApiResponse<StorageFolderInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['storage-folders'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<StorageFolderInterface[]>>(
        '/api/user/storage/folders',
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
    enabled,
  })
}

export const useGetStorageFolderQuery = (
  enabled: MaybeRefOrGetter<boolean> = true,
  id: MaybeRefOrGetter<number | null>,
) => {
  return useQuery<ApiResponse<StorageFolderInterface>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['storage-folder', id],
    queryFn: async () => {
      const folderId = toValue(id)
      const response = await axiosInstance.get<ApiResponse<StorageFolderInterface>>(
        `/api/user/storage/folders/${folderId}`,
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
    enabled,
  })
}

export const useAddFilesMutation = () => {
  return useMutation<
    ApiResponse,
    AxiosError<ValidationErrorResponse>,
    { id: number; data: FamilyMediaFormValues }
  >({
    mutationFn: async ({ id, data }: { id: number; data: FamilyMediaFormValues }) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'media') {
          console.log('value', value)
          value.forEach((file: File) => {
            formData.append(`files[]`, file)
          })
        } else {
          formData.append(key, value)
        }
      })

      const response = await axiosInstance.post<ApiResponse>(
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
}

export const useGetFolderMediaQuery = (
  enabled: MaybeRefOrGetter<boolean> = true,
  id: MaybeRefOrGetter<number | null>,
) => {
  return useQuery<ApiResponse<AttachmentInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['folder-media', id],
    queryFn: async () => {
      const folderId = toValue(id)
      const response = await axiosInstance.get<ApiResponse<AttachmentInterface[]>>(
        `/api/user/storage/folders/${folderId}/media`,
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
    enabled,
  })
}
