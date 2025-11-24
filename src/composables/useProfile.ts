import { useGetProfileQuery } from '@/services/authentication.services'
import { useProfileStore } from '@/stores/profile.store'
import { handleApiError } from '@/helpers/error.helpers'
import { useMessage } from 'naive-ui'
import { computed } from 'vue'

export const useProfile = () => {
  const message = useMessage()
  const profileStore = useProfileStore()
  const { data, isPending, refetch } = useGetProfileQuery({
    enabled: false,
  })

  const userProfileLoading = computed(() => isPending.value)

  const getProfile = async () => {
    try {
      const response = await refetch()
      profileStore.setStoreProp('user', response.data?.data)
    } catch (error) {
      handleApiError(error, message)
    }
  }

  return {
    userProfileLoading,
    getProfile,
  }
}
