export interface Media {
  id: string
  url: string
  type: string
}

export interface Country {
  name: string
  dialing_code: string
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status?: string
}

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
