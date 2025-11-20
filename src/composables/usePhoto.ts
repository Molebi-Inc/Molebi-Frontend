import axiosInstance from '@/config/axios.config'
import { useMessage } from 'naive-ui'
import { useUpdateProfileAvatarMutation } from '@/services/settings.services'
import { useGetProfileQuery } from '@/services/authentication.services'
import { useProfileStore } from '@/stores/profile.store'
import { handleApiError } from '@/helpers/error.helpers'

export const usePhoto = () => {
  const message = useMessage()
  const updateProfileAvatarMutation = useUpdateProfileAvatarMutation()
  const { refetch: refetchProfile } = useGetProfileQuery({ enabled: false })
  const profileStore = useProfileStore()

  const handlePhotoUpload = async (file: File | null) => {
    try {
      await updateProfileAvatarMutation.mutateAsync(file)
      message.success('Profile picture updated successfully')
      refetchProfile().then((result) => {
        if (result.data?.data) {
          profileStore.setStoreProp('user', result.data.data)
        }
      })
    } catch (error) {
      handleApiError(error, message)
    }
  }
  return {
    handlePhotoUpload,
  }
}
