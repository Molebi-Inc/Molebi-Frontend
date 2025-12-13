import type { AttachmentInterface } from './vault.types'

export interface StorageFormValues {
  name: string
  description?: string
  files: File[]
}

export interface StorageFolderInterface {
  id: number
  family_tree_id: number
  name: string
  description: string
  color_code: string | null
  is_shared: boolean
  share_token_expires_at: string | null
  total_files: number
  total_size: number
  formatted_size: string
  media_counts: {
    images: number
    videos: number
    audios: number
  }
  creator: {
    id: number
    name: string
    email: string
  }
  media: AttachmentInterface[]
  created_at: string
  updated_at: string
}

export interface StorageStoreInterface {
  selectedFolder: StorageFolderInterface | null
  folderMedia: AttachmentInterface[]
  folderMediaLoading: boolean
  folders: StorageFolderInterface[]
  foldersLoading: boolean
}


export interface ShareFolderFormValues {
  family_member_id: number[]
  permission: 'view' | 'edit' | 'manage'
}