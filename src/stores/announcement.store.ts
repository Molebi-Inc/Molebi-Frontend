import { defineStore } from 'pinia'
import type { AnnouncementStoreInterface } from '@/types/announcement.types'

export const useAnnouncementStore = defineStore('announcement', {
  state: (): AnnouncementStoreInterface => ({
    announcements: [],
    loading: false,
    error: null,
    params: {
      page: 1,
      per_page: 5,
    },
    selectedAnnouncement: null,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
