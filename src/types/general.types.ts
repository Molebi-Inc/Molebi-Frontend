import type { FamilyMemberInterface } from './family-tree.types'
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

export interface PaginationParams {
  page: number
  per_page: number
}

export type FormType = 'announcement' | 'family_tradition' | 'family_tradition_media'

export interface HomeFormConfig {
  id: number
  name: FormType
  title: string
  component: any
}

export interface GeneralStoreInterface {
  familyMembers: FamilyMemberInterface[]
}
