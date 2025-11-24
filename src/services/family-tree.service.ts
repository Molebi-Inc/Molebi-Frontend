import { useAuthConfig } from '@/config/auth.config'
import type { SignupFormValues, SignupResponseData } from '@/types/authentication.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type { AxiosError } from 'axios'
import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { toValue } from 'vue'
import type { MaybeRef } from 'vue'
import type {
  FamilyMemberFormValues,
  FamilyMemberInterface,
  FamilyRequestFormValues,
  FamilyTreeByUniqueIdentifierResponse,
} from '@/types/family-tree.types'
const authConfig = useAuthConfig()

// Add Family Member endpoint
export const useAddFamilyMemberMutation = () => {
  return useMutation<
    ApiResponse<FamilyMemberFormValues>,
    AxiosError<ValidationErrorResponse>,
    FamilyMemberFormValues
  >({
    mutationFn: async (data: FamilyMemberFormValues) => {
      const response = await axiosInstance.post<ApiResponse<FamilyMemberFormValues>>(
        '/api/user/family-members',
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

// Update Family Member endpoint
export const useUpdateFamilyMemberMutation = () => {
  return useMutation<
    ApiResponse<FamilyMemberFormValues>,
    AxiosError<ValidationErrorResponse>,
    { id: number; data: FamilyMemberFormValues }
  >({
    mutationFn: async ({ id, data }: { id: number; data: FamilyMemberFormValues }) => {
      const response = await axiosInstance.post<ApiResponse<FamilyMemberFormValues>>(
        `/api/user/family-members/${id}`,
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

// Request to Join Family endpoint
export const useRequestToJoinFamilyMutation = () => {
  return useMutation<
    ApiResponse<FamilyRequestFormValues>,
    AxiosError<ValidationErrorResponse>,
    FamilyRequestFormValues
  >({
    mutationFn: async (data: FamilyRequestFormValues) => {
      const response = await axiosInstance.post<ApiResponse<FamilyRequestFormValues>>(
        '/api/user/join-requests',
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

export const useGetFamilyMembersQuery = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<FamilyMemberInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['family-members'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<FamilyMemberInterface[]>>(
        '/api/user/family-members',
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: options?.enabled ?? true,
  })
}

export const useGetFamilyMembersByIdentifierQuery = (
  identifier: MaybeRef<string>,
  options?: {
    enabled?: MaybeRef<boolean>
  },
) => {
  return useQuery<
    ApiResponse<FamilyTreeByUniqueIdentifierResponse>,
    AxiosError<ValidationErrorResponse>
  >({
    queryKey: ['family-members-by-identifier', identifier],
    queryFn: async () => {
      const id = toValue(identifier)
      const response = await axiosInstance.get<ApiResponse<FamilyTreeByUniqueIdentifierResponse>>(
        `/api/user/family-members/by-tree/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: options?.enabled,
  })
}
