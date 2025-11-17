import type {
  SignupFormValues,
  VerifyEmailValues,
  ResendOtpParams,
  PersonalInformationFormValues,
  SigninFormValues,
  SigninResponseData,
  SigninUser,
  VerifyEmailResponseData,
} from '@/types/authentication.types'
import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import type { AxiosError } from 'axios'
import { useAuthConfig } from '@/config/auth.config'

const authConfig = useAuthConfig()
// Response types
interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status?: string
}

// Auth-specific response payloads
interface SignupResponseData {
  token: string
}

// Validation error response structure matches Laravel validation errors
export interface ValidationErrorResponse {
  success: false
  message: string
  errors: Record<string, string[]>
  response?: {
    data: {
      message: string
    }
  }
}

// Register/Signup endpoint
export const useSignupMutation = () => {
  return useMutation<
    ApiResponse<SignupResponseData>,
    AxiosError<ValidationErrorResponse>,
    SignupFormValues
  >({
    mutationFn: async (data: SignupFormValues) => {
      const response = await axiosInstance.post<ApiResponse<SignupResponseData>>(
        '/api/user/auth/register',
        data,
      )
      return response.data
    },
  })
}

// Verify Email endpoint
export const useVerifyEmailMutation = () => {
  return useMutation<
    ApiResponse<VerifyEmailResponseData>,
    AxiosError<ValidationErrorResponse>,
    VerifyEmailValues
  >({
    mutationFn: async (data: VerifyEmailValues) => {
      const response = await axiosInstance.post<ApiResponse<VerifyEmailResponseData>>(
        '/api/user/verify-email',
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

// Resend OTP endpoint (GET request)
export const useResendOtpMutation = () => {
  return useMutation<ApiResponse, AxiosError<ValidationErrorResponse>, void>({
    mutationFn: async () => {
      const response = await axiosInstance.get<ApiResponse>('/api/user/resend-verification', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
    retry: false, // Don't retry on failure for this endpoint
  })
}

// Verify Email endpoint
export const useUpdateProfileMutation = () => {
  return useMutation<
    ApiResponse,
    AxiosError<ValidationErrorResponse>,
    PersonalInformationFormValues
  >({
    mutationFn: async (data: PersonalInformationFormValues) => {
      const response = await axiosInstance.post<ApiResponse>(
        '/api/user/profile',
        {
          ...data,
          _method: 'PUT',
        },
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

// Verify Email endpoint
export const useSigninMutation = () => {
  return useMutation<
    ApiResponse<SigninResponseData>,
    AxiosError<ValidationErrorResponse>,
    SigninFormValues
  >({
    mutationFn: async (data: SigninFormValues) => {
      const response = await axiosInstance.post<ApiResponse<SigninResponseData>>(
        '/api/user/auth/login',
        data,
      )
      return response.data
    },
  })
}

export const useGetProfileMutation = () => {
  return useMutation<ApiResponse<SigninUser>, AxiosError<ValidationErrorResponse>, undefined>({
    mutationFn: async () => {
      const response = await axiosInstance.get<ApiResponse<SigninUser>>('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
  })
}

export const useLogoutMutation = () => {
  return useMutation<ApiResponse, AxiosError<ValidationErrorResponse>, void>({
    mutationFn: async () => {
      const response = await axiosInstance.post<ApiResponse>('/api/user/auth/logout', {
        headers: {
          Authorization: `Bearer ${authConfig.getToken()}`,
        },
      })
      return response.data
    },
    retry: false,
  })
}
