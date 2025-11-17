import type { FamilyMember } from './family-member.types'
export interface FamilyTraditionFormValues {
  name: string
  description: string
  date?: string
  time?: string | null
  reoccurrence: string | null
  date_mode: 'always on this date' | 'date changes annually' | null
  family_members: FamilyMember[]
}

export interface FamilyMediaFormValues {
  title: string
  description: string
  media_type: 'audio' | 'file'
  media: File[]
}
