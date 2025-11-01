import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('authentication', {
  state: () => ({
    signupForm: { email: '', password: '', password_confirmation: '' },
    resetPasswordForm: { email: '' },
    landingViewStep: 1,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },
})
