import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'
import type { CreateFolderValues } from '@/types/vault.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type { FolderInterface } from '@/types/vault.types'
import type { AxiosError } from 'axios'
import type { MaybeRefOrGetter } from 'vue'

const authConfig = useAuthConfig()

export const useVerifyPinMutation = () => {
  return useMutation<
    ApiResponse<{ success: boolean; message: string }>,
    AxiosError<ValidationErrorResponse>,
    { pin: string; id: number }
  >({
    mutationFn: async ({ pin, id }: { pin: string; id: number }) => {
      const response = await axiosInstance.post<ApiResponse<{ success: boolean; message: string }>>(
        `/api/user/memory-vaults/${id}/access`,
        { pin_code: pin },
        { headers: { Authorization: `Bearer ${authConfig.getToken()}` } },
      )
      return response.data
    },
  })
}

export const useUpdateFolderMutation = () => {
  const updateFolderMutation = useMutation<
    ApiResponse<FolderInterface>,
    AxiosError<ValidationErrorResponse>,
    { folder: CreateFolderValues; id: number }
  >({
    mutationFn: async ({ folder, id }: { folder: CreateFolderValues; id: number }) => {
      const response = await axiosInstance.put<ApiResponse<FolderInterface>>(
        `/api/user/memory-vaults/${id}`,
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
