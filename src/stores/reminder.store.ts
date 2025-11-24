import { defineStore } from 'pinia'
import type { ReminderStoreInterface } from '@/types/reminder.types'

export const useReminderStore = defineStore('reminder', {
  state: (): ReminderStoreInterface => ({
    reminders: [],
    loading: false,
    error: null,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
