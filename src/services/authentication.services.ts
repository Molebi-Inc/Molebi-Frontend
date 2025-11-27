import type {
  SignupFormValues,
  VerifyEmailValues,
  ResendOtpParams,
  PersonalInformationFormValues,
  SigninFormValues,
  SigninResponseData,
  ForgotPasswordValues,
  ResetPasswordValues,
  SigninUser,
  ForgotPasswordResponseData,
  VerifyEmailResponseData,
  ResendOtpResponseData,
} from '@/types/authentication.types'
import type { AxiosError } from 'axios'
import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { useAuthConfig } from '@/config/auth.config'
import type { ProfileFormValues } from '@/types/profile.types'
import type { SignupResponseData } from '@/types/authentication.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'

const authConfig = useAuthConfig()

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
            Authorization: `Bearer ${authConfig.getToken(true)}`,
          },
        },
      )
      return response.data
    },
  })
}

// Resend OTP endpoint (GET request)
export const useResendOtpMutation = () => {
  return useMutation<ApiResponse<ResendOtpResponseData>, AxiosError<ValidationErrorResponse>, void>({
    mutationFn: async () => {
      const response = await axiosInstance.get<ApiResponse<ResendOtpResponseData>>('/api/user/resend-verification', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authConfig.getToken(true)}`,
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
    PersonalInformationFormValues | ProfileFormValues
  >({
    mutationFn: async (data: PersonalInformationFormValues | ProfileFormValues) => {
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

export const useGetProfileQuery = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery<ApiResponse<SigninUser>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['profile'],
    enabled,
    queryFn: async () => {
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
      const response = await axiosInstance.get<ApiResponse>('/api/user/auth/logout', {
        headers: { Authorization: `Bearer ${authConfig.getToken()}` },
      })
      return response.data
    },
  })
}

//forgot password endpoint
export const useForgotPasswordMutation = () => {
  return useMutation<
    ApiResponse<ForgotPasswordResponseData>,
    AxiosError<ValidationErrorResponse>,
    ForgotPasswordValues
  >({
    mutationFn: async (data: ForgotPasswordValues) => {
      const response = await axiosInstance.post<ApiResponse<ForgotPasswordResponseData>>(
        '/api/user/auth/forgot-password',
        data,
      )
      return response.data
    },
    retry: false,
  })
}

export const useResetPasswordMutation = () => {
  return useMutation<ApiResponse, AxiosError<ValidationErrorResponse>, ResetPasswordValues>({
    mutationFn: async (data: ResetPasswordValues) => {
      const { email, ...rest } = data
      const response = await axiosInstance.post<ApiResponse>(
        `/api/user/auth/reset-password?email=${email}`,
        { ...rest, email },
      )
      return response.data
    },
    retry: false,
  })
}
