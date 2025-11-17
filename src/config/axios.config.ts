import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useMessage } from 'naive-ui'
// Get base URL from environment variable
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://dev-api.mymolebi.com/'

const message = useMessage()

// Create axios instance
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor - can be used to add auth tokens, etc.
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any common headers here (e.g., authorization token)
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - handles errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const responseData = error.response?.data

    // Handle different error status codes
    switch (status) {
      case 401:
        // Unauthorized - handle authentication errors
        // Could redirect to login or clear tokens
        break

      case 403:
        // Forbidden - user doesn't have permission
        break

      case 422:
        // Unprocessable Entity - validation errors
        // Don't log here - let the component handle validation errors
        // The error will be available in error.response.data with the structure:
        // { success: false, message: string, errors: Record<string, string[]> }
        break

      case 404:
        // Not Found
        break

      case 500:
        // Internal Server Error
        break

      default:
        // Other errors
        if (error.request && !error.response) {
          // Network error
          message.error('Network error - no response received')
        } else {
          message.error('Request error')
        }
        break
    }

    // Return the error so TanStack Query can handle it
    return Promise.reject(error)
  },
)

export default axiosInstance
