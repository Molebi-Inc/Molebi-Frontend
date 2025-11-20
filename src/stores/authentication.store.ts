import { defineStore } from 'pinia'
import type { AuthenticationStoreInterface } from '@/types/authentication.types'

export const useAuthenticationStore = defineStore('authentication', {
  state: (): AuthenticationStoreInterface => ({
    resetPasswordForm: {
      email: '',
      otp_code: '',
      password: '',
      password_confirmation: '',
    },
    landingViewStep: 1,
    signupForm: {
      email: '',
    },
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
