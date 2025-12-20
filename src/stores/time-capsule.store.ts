import { defineStore } from 'pinia'
import type { TimeCapsuleStoreInterface } from '@/types/time-capsule.types'

export const useTimeCapsuleStore = defineStore('time-capsule', {
  state: (): TimeCapsuleStoreInterface => ({
    selectedTimeCapsule: null,
    timeCapsuleForm: {
      title: '',
      description: '',
      files: [],
      open_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      family_member_ids: [],
    },
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
