import { defineStore } from 'pinia'
import type { FamilyTraditionStoreInterface } from '@/types/family-tradition.types'

export const useFamilyTraditionStore = defineStore('family-tradition', {
  state: (): FamilyTraditionStoreInterface => ({
    familyTraditions: [],
    loading: false,
    error: null,
    path: 'Upcoming',
    params: {
      page: 1,
      per_page: 5,
    },
    selectedFamilyTradition: null,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
