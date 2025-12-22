import type { Component } from 'vue'
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

export interface ApiRequestParams extends PaginationParams {
  sort_by: string
  sort_dir: 'asc' | 'desc'
  search: string
}

export type FormType = 'announcement' | 'family_tradition' | 'family_tradition_media'

export interface HomeFormConfig {
  id: number
  name: FormType
  title: string
  component: Component
}

export interface GeneralStoreInterface {
  familyMembers: FamilyMemberInterface[]
  flow: string
}

export interface StateInterface {
  id: number
  name: string
}

export interface TabInterface {
  name: string
  label: string
  component: Component
  props?: Record<string, unknown>
}

export type NotificationType =
  | 'branch'
  | 'connection'
  | 'memory'
  | 'birthday'
  | 'update'
  | 'generic'

interface NotificationAction {
  label: string
  approve?: boolean
  onClick?: (n: NotificationItem) => void
}

export interface NotificationItem {
  id: string | number
  title: string
  message: string
  timeAgo: string
  type?: NotificationType
  actions?: NotificationAction[]
}
