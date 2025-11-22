import type { ApiResponse } from '@/types/general.types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/general.types'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'

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
