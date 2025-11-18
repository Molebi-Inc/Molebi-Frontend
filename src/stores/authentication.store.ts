import { defineStore } from 'pinia'
import type { SigninUser } from '@/types/authentication.types'

export const useAuthenticationStore = defineStore('authentication', {
  state: () => ({
    signupForm: { email: '', password: '', password_confirmation: '' },
    resetPasswordForm: { email: '' },
    landingViewStep: 1,
    loggedInUser: null as SigninUser | null,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
