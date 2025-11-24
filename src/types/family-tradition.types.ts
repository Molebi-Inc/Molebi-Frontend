import type { FamilyMemberInterface } from './family-tree.types'
import type { FamilyTreeDetails } from './family-tree.types'
import type { PaginationParams } from './general.types'
export interface FamilyTraditionFormValues {
  title: string
  description: string
  date?: string
  time?: string | null
  recurrence: string | null
  date_mode: 'always on this date' | 'date changes annually' | null
  family_member_ids: FamilyMemberInterface['id'][]
}

export interface FamilyMediaFormValues {
  title: string
  description: string
  media_type: 'audio' | 'file'
  media: File[]
}

export interface MemberOfFamilyTradition {
  id: number
  name: string | null
  email: string | null
  avatar_url: string | null
}

export interface FamilyTraditionMedia {
  id: number
  url: string
  name: string
  size: number
}

export interface FamilyTradition {
  id: number
  family_tree_id: number
  title: string
  description: string
  date: string
  next_occurrence: string
  display_date: string
  time: string
  recurrence: string | null
  is_recurring: boolean
  date_mode: string | null
  is_past: boolean
  is_upcoming: boolean
  family_tree: Partial<FamilyTreeDetails>
  members: MemberOfFamilyTradition[]
  images: FamilyTraditionMedia[]
  audios: FamilyTraditionMedia[]
  created_at: string
  updated_at: string
}

export type FamilyTraditionTab = 'Upcoming' | 'Past'

export interface FamilyTraditionStoreInterface {
  familyTraditions: FamilyTradition[]
  loading: boolean
  path: FamilyTraditionTab
  error: Error | null
  params: PaginationParams
  selectedFamilyTradition: FamilyTradition | null
}
