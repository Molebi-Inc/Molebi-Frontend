import type { FamilyMember } from './family-member.types'
export interface AnnouncementFormValues {
  type: 'information' | 'alert' | null
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  family_members: FamilyMember[]
  create_reminder: boolean
}

export interface AnnouncementFormErrors {
  title?: { message: string }[]
  description?: { message: string }[]
  priority?: { message: string }[]
  family_members?: { message: string }[]
}
