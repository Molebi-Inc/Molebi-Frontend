import { useAuthConfig } from '@/config/auth.config'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type { AxiosError } from 'axios'
import { useMutation } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'

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
