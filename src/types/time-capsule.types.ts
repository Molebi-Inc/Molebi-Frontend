import type { UploadFileInfo } from 'naive-ui'
import type { FamilyMember } from './family-member.types'
// import type { Media } from './general.types'

export interface TimeCapsule {
  id: string
  title: string
  description: string
  body: string
  media: UploadFileInfo[]
  open_date: Date
  family_members: FamilyMember[]
}

export interface TimeCapsuleFormValues {
  title: string
  description: string
  body: string
  open_date?: string
  family_members: FamilyMember[]
  media: File[]
}
