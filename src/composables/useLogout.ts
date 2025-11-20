import { useAuthConfig } from '@/config/auth.config'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { handleApiError } from '@/helpers/error.helpers'
import { useLogoutMutation } from '@/services/authentication.services'

const $router = useRouter()
const message = useMessage()
const authConfig = useAuthConfig()

export const useLogout = () => {
  const logoutMutation = useLogoutMutation()

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()

      authConfig.removeToken()
      await $router.push({ name: 'Guests.SigninView' })
    } catch (error) {
      handleApiError(error, message)
    }
  }

  return {
    logout,
  }
}
