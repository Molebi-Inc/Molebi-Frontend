import type { UploadFileInfo } from 'naive-ui'
import type { FamilyMemberInterface } from './family-tree.types'
// import type { Media } from './general.types'

export interface TimeCapsule {
  id: string
  title: string
  description: string
  body: string
  media: UploadFileInfo[]
  open_date: Date
  family_members: Partial<FamilyMemberInterface>[]
}

export interface TimeCapsuleFormValues {
  title: string
  description: string
  body: string
  open_date?: string
  family_members: Partial<FamilyMemberInterface>[]
  media: File[]
}
