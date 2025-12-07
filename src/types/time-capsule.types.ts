import type { UploadFileInfo } from 'naive-ui'
import type { FamilyMemberInterface } from './family-tree.types'
import type { AttachmentInterface } from './vault.types'
import type { ApiRequestParams } from './general.types'
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

export interface TimeCapsuleInterface {
  id: number
  family_tree_id: number
  created_by: Partial<FamilyMemberInterface>
  title: string
  description: string
  open_at: string
  attachments: AttachmentInterface[]
  family_members?: Partial<FamilyMemberInterface>[] | null
}

export interface TimeCapsuleFormValues {
  // family_tree_id: number
  password?: string
  title: string
  description: string
  open_at?: string
  family_member_ids: FamilyMemberInterface['id'][]
  files: File[]
}

export interface TimeCapsuleRequestParams extends ApiRequestParams {
  family_tree_id: number
  open_at_from: string
  open_at_to: string
}

export interface TimeCapsuleStoreInterface {
  selectedTimeCapsule: TimeCapsuleInterface | null
}
