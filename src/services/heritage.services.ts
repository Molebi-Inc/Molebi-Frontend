import { AxiosError } from 'axios'
import type { MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'
import type { HeritageDataInterface } from '@/types/heritage.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'

const authConfig = useAuthConfig()

export const useGetHeritageQuery = (enabled: MaybeRefOrGetter<boolean> = true) => {
  return useQuery<ApiResponse<HeritageDataInterface>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['heritage'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<HeritageDataInterface>>(
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
