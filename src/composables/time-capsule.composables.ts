import { computed, ref } from 'vue'
import type { TimeCapsuleInterface } from '@/types/time-capsule.types'
import { useTimeCapsuleStore } from '@/stores/time-capsule.store'
import { useGetTimeCapsuleByIdQuery } from '@/services/time-capsule.services'
import { handleApiError } from '@/helpers/error.helpers'
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'

export const useTimeCapsule = () => {
  const message = useMessage()
  const $route = useRoute()
  const $router = useRouter()
  const timeCapsuleStore = useTimeCapsuleStore()
  const isLargeScreen = useMediaQuery('(min-width: 768px)')
  const getTimeCapsuleDetails = useGetTimeCapsuleByIdQuery(
    Number($route.params.id),
    !!Number($route.params.id),
  )

  const loading = ref<boolean>(false)

  const selectedCapsule = computed<TimeCapsuleInterface | null>(
    () => timeCapsuleStore.selectedTimeCapsule,
  )

  const fetchTimeCapsuleDetails = async () => {
    loading.value = true
    try {
      const response = await getTimeCapsuleDetails.refetch()
      timeCapsuleStore.setStoreProp('selectedTimeCapsule', response.data?.data)
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = false
    }
  }

  const handleEditTimeCapsule = async () => {
    $router.push({
      name: 'App.TimeCapsules.Edit',
      params: { id: selectedCapsule.value?.id, step: isLargeScreen.value ? undefined : '1' },
    })
  }

  return {
    loading,
    capsule: selectedCapsule,
    handleEditTimeCapsule,
    fetchTimeCapsuleDetails,
  }
}
