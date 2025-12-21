import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'
import type { CreateFolderValues, CreateFilesValues } from '@/types/vault.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type { FolderInterface } from '@/types/vault.types'
import type { AxiosError } from 'axios'
import type { MaybeRefOrGetter } from 'vue'

const authConfig = useAuthConfig()

export const useUpdateFolderMutation = () => {
  const updateFolderMutation = useMutation<
    ApiResponse<FolderInterface>,
    AxiosError<ValidationErrorResponse>,
    { folder: CreateFolderValues | CreateFilesValues; id: number }
  >({
    mutationFn: async ({
      folder,
      id,
    }: {
      folder: CreateFolderValues | CreateFilesValues
      id: number
    }) => {
      // Check if folder contains files that need FormData
      const hasFiles =
        'files' in folder &&
        (folder as CreateFilesValues).files &&
        (folder as CreateFilesValues).files.length > 0

      let payload: FormData | CreateFolderValues | CreateFilesValues
      const headers: Record<string, string> = {
        Authorization: `Bearer ${authConfig.getToken()}`,
        ...(hasFiles && { 'Content-Type': 'multipart/form-data' }),
      }

      if (hasFiles) {
        const formData = new FormData()
        ;(folder as CreateFilesValues).files.forEach((file: File) => {
          formData.append('files[]', file)
        })
        formData.append('_method', 'PUT')
        payload = formData
      } else {
        payload = folder
      }

      const response = await axiosInstance.post<ApiResponse<FolderInterface>>(
        `/api/user/memory-vaults/${id}`,
        hasFiles ? payload : { ...folder, _method: 'PUT' },
        {
          headers,
        },
      )
      return response.data
    },
  })
  return updateFolderMutation
}

export const useDeleteFolderMutation = () => {
  const deleteFolderMutation = useMutation<
    ApiResponse,
    AxiosError<ValidationErrorResponse>,
    { id: number }
  >({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await axiosInstance.delete<ApiResponse>(`/api/user/memory-vaults/${id}`, {
        headers: { Authorization: `Bearer ${authConfig.getToken()}` },
      })
      return response.data
    },
  })
  return deleteFolderMutation
}

export const useGetVaultFoldersQuery = (enabled: MaybeRefOrGetter<boolean> = true) => {
  return useQuery<ApiResponse<FolderInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['vault-folders'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<FolderInterface[]>>(
        '/api/user/memory-vaults',
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
    enabled,
  })
}

export const useCreateVaultFolderMutation = () => {
  return useMutation<
    ApiResponse<FolderInterface>,
    AxiosError<ValidationErrorResponse>,
    CreateFolderValues
  >({
    mutationFn: async (folder: CreateFolderValues) => {
      const response = await axiosInstance.post<ApiResponse<FolderInterface>>(
        '/api/user/memory-vaults',
        folder,
        { headers: { Authorization: `Bearer ${authConfig.getToken()}` } },
      )
      return response.data
    },
  })
}

export const useUpdateVaultPinMutation = () => {
  return useMutation<
    ApiResponse<FolderInterface>,
    AxiosError<ValidationErrorResponse>,
    { current_pin: string; new_pin: string; id: number }
  >({
    mutationFn: async ({
      current_pin,
      new_pin,
      id,
    }: {
      current_pin: string
      new_pin: string
      id: number
    }) => {
      const response = await axiosInstance.post<ApiResponse<FolderInterface>>(
        `/api/user/memory-vaults/${id}`,
        { current_pin, new_pin, _method: 'PUT' },
        { headers: { Authorization: `Bearer ${authConfig.getToken()}` } },
      )
      return response.data
    },
  })
}

export const useGetVaultFolderMutation = () => {
  return useMutation<
    ApiResponse<FolderInterface>,
    AxiosError<ValidationErrorResponse>,
    { id: number; pin: string }
  >({
    mutationFn: async ({ id, pin }: { id: number; pin: string }) => {
      const response = await axiosInstance.post<ApiResponse<FolderInterface>>(
        `/api/user/memory-vaults/${id}`,
        { pin: pin },
        { headers: { Authorization: `Bearer ${authConfig.getToken()}` } },
      )
      return response.data
    },
  })
}

export const useDeleteVaultMediaMutation = () => {
  return useMutation<
    ApiResponse,
    AxiosError<ValidationErrorResponse>,
    { id: number; mediaId: number }
  >({
    mutationFn: async ({ id, mediaId }: { id: number; mediaId: number }) => {
      const response = await axiosInstance.delete<ApiResponse>(
        `/api/user/memory-vaults/${id}/media/${mediaId}`,
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
  })
}
