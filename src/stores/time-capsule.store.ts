import { defineStore } from 'pinia'
import type { TimeCapsuleStoreInterface } from '@/types/time-capsule.types'

export const useTimeCapsuleStore = defineStore('time-capsule', {
  state: (): TimeCapsuleStoreInterface => ({
    selectedTimeCapsule: null,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
