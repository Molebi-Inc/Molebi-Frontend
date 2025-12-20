import type { AxiosError } from 'axios'
import type { FamilyMemberInterface } from './family-tree.types'
import type { FamilyTreeDetails } from './family-tree.types'
import type { PaginationParams, ValidationErrorResponse } from './general.types'
export interface AnnouncementFormValues {
  type: 'information' | 'alert' | null
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  member_ids: FamilyMemberInterface['id'][]
  create_reminder: boolean
}

export interface AnnouncementFormErrors {
  title?: { message: string }[]
  description?: { message: string }[]
  priority?: { message: string }[]
  family_members?: { message: string }[]
}

export interface Announcement {
  id: number
  family_tree_id: number
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  send_to_all: boolean
  creator: {
    id: number
    name: string
  }
  family_tree: Pick<FamilyTreeDetails, 'id' | 'name'>
  members: FamilyMemberInterface[]
  view_count: number
  is_viewed: boolean
  created_at: string
}

export interface AnnouncementStoreInterface {
  announcements: Announcement[]
  loading: boolean
  error: AxiosError<ValidationErrorResponse> | null
  params: PaginationParams
  selectedAnnouncement: Announcement | null
}
