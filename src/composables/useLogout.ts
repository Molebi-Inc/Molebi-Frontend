import { useAuthConfig } from '@/config/auth.config'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { handleApiError } from '@/helpers/error.helpers'
import { useLogoutMutation } from '@/services/authentication.services'

export const useLogout = () => {
  const $router = useRouter()
  const message = useMessage()
  const authConfig = useAuthConfig()
  const logoutMutation = useLogoutMutation()

  const logout = async () => {
    try {
      authConfig.removeToken()
      await $router.replace({ name: 'Guests.SigninView' })

      // Best-effort server logout; don't block UI on network.
      logoutMutation.mutateAsync().catch(() => {})
    } catch (error) {
      handleApiError(error, message)
    }
  }

  return {
    logout,
  }
}
