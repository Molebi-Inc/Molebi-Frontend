import { defineStore } from 'pinia'
import type { GeneralStoreInterface } from '@/types/general.types'

export const useGeneralStore = defineStore('general', {
  state: (): GeneralStoreInterface => ({
    familyMembers: [],
    flow: '',
    tourStages: [],
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
