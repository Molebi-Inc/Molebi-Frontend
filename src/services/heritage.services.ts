import { AxiosError } from 'axios'
import type { MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'
import type { HeritageInterface } from '@/types/heritage.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'

const authConfig = useAuthConfig()

export const useGetHeritageQuery = (enabled: MaybeRefOrGetter<boolean> = true) => {
  return useQuery<ApiResponse<HeritageInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['heritage'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<HeritageInterface[]>>(
        '/api/user/cultural-heritages',
        {
          headers: { Authorization: `Bearer ${authConfig.getToken()}` },
        },
      )
      return response.data
    },
    enabled,
  })
}
