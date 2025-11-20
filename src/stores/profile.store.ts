import { defineStore } from 'pinia'
import type { ProfileState } from '@/types/profile.types'
import type { SigninUser } from '@/types/authentication.types'
import type {
  NotificationSettings,
  PrivacySettings,
  Settings,
  TreeSettings,
} from '@/types/settings.types'

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    user: null as SigninUser | null,
    settings: null as Settings | null,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },

  getters: {
    userDetails(state: ProfileState): SigninUser | null {
      return state.user
    },
    userAvatarUrl(state: ProfileState): string {
      const firstName = state.user?.first_name?.trim()
      const familyName = state.user?.family_name?.trim()
      const hasName = Boolean(firstName || familyName)
      const fallbackName = hasName ? `${firstName ?? ''} ${familyName ?? ''}`.trim() : 'Molebi User'
      const encodedName = encodeURIComponent(fallbackName)

      return (
        state.user?.profile_picture ||
        state.user?.avatar ||
        `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=52`
      )
    },
    treeSettings(state: ProfileState): TreeSettings | null {
      return state.settings?.family_tree_settings || null
    },
    privacySettings(state: ProfileState): PrivacySettings | null {
      return state.settings?.privacy_settings || null
    },
    notificationSettings(state: ProfileState): NotificationSettings | null {
      return state.settings?.notification_settings || null
    },
  },
})
