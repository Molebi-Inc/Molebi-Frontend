import { defineStore } from 'pinia'
import type { VaultStoreInterface } from '@/types/vault.types'

export const useVaultStore = defineStore('vault', {
  state: (): VaultStoreInterface => ({
    selectedFolder: null,
    folders: [],
    foldersLoading: false,
    pin: '0000',
    pinStep: 1,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
