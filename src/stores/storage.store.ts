import { defineStore } from 'pinia'
import type { StorageStoreInterface } from '@/types/storage.types'

export const useStorageStore = defineStore('storage', {
  state: (): StorageStoreInterface => ({
    edit: false,
    selectedFolder: null,
    folders: [],
    foldersLoading: false,
    folderMedia: [],
    folderMediaLoading: true,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
