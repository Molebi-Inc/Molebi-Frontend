import { useAuthConfig } from '@/config/auth.config'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { handleApiError } from '@/helpers/error.helpers'
import { useLogoutMutation } from '@/services/authentication.services'
import { useQueryClient } from '@tanstack/vue-query'
import { useProfileStore } from '@/stores/profile.store'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import { useGeneralStore } from '@/stores/general.store'
import { useAnnouncementStore } from '@/stores/announcement.store'

export const useLogout = () => {
  const $router = useRouter()
  const message = useMessage()
  const authConfig = useAuthConfig()
  const logoutMutation = useLogoutMutation()
  const queryClient = useQueryClient()

  const logout = async () => {
    try {
      authConfig.removeToken()

      // Clear all cached query data and reset user-specific stores before
      // navigating so the next user never sees stale data.
      queryClient.clear()
      useProfileStore().$reset()
      useFamilyTreeStore().$reset()
      useGeneralStore().$reset()
      useAnnouncementStore().$reset()

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
