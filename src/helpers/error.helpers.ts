import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/services/authentication.services'
import type { MessageApi } from 'naive-ui'

/**
 * Handles API errors, specifically formatting validation errors for 422 status codes
 * @param error - The axios error to handle
 * @param message - Naive UI message instance for displaying errors
 */
export function handleApiError(error: unknown, message: MessageApi): void {
  const axiosError = error as AxiosError<ValidationErrorResponse>

  // Handle 422 validation errors
  if (axiosError?.response?.status === 422) {
    const validationErrors = axiosError.response.data.errors

    // Loop through each field and display all error messages
    Object.entries(validationErrors).forEach(([field, messages]) => {
      messages.forEach((errorMessage) => {
        // Format: "Field name: error message" (e.g., "Email: The email has already been taken.")
        const formattedMessage = `${formatFieldName(field)}: ${errorMessage}`
        message.error(formattedMessage)
      })
    })
  } else {
    // For other errors, show the error message from the response or a default message
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'An error occurred. Please try again.'
    message.error(errorMessage)
  }
}

/**
 * Formats field names to be more readable (e.g., "first_name" -> "First Name")
 * @param fieldName - The field name to format
 * @returns Formatted field name
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
