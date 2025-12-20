import type { FamilyMemberInterface } from './family-tree.types'

export interface CreateFolderValues {
  name: string | undefined
  title: string | undefined
}

export interface CreateFilesValues {
  files: File[]
}

export interface AttachmentInterface {
  id: number
  name: string
  file_name: string
  mime_type: string
  size: number
  url: string
  thumbnail: string | null
  date: string | null
}

export interface FolderInterface {
  id: number
  user_id: number
  title: string
  description: string
  date_of_memory: string
  is_public: boolean
  created_at: string
  updated_at: string
  attachments: AttachmentInterface[]
  viewers: Partial<FamilyMemberInterface>[]
}

export interface VaultStoreInterface {
  selectedFolder: FolderInterface | null
  folders: FolderInterface[]
  foldersLoading: boolean
  pin: string
}
