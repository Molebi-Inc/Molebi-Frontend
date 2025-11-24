import { useMessage } from 'naive-ui'
import { watch, computed, ref } from 'vue'
import { useGeneralStore } from '@/stores/general.store'
import type { PaginationParams } from '@/types/general.types'
import {
  useGetAnnouncementsQuery,
  useUpdateAnnouncementMutation,
  useAddAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '@/services/announcement'
import { useAnnouncementStore } from '@/stores/announcement.store'
import {
  useGetFamilyTraditionsQuery,
  useAddFamilyTraditionMutation,
  useUpdateFamilyTraditionMutation,
  useDeleteFamilyTraditionMutation,
} from '@/services/family-tradition.service'
import { useFamilyTraditionStore } from '@/stores/family-tradition.store'
import { useGetFamilyMembersQuery } from '@/services/family-tree.service'
import type { FamilyTraditionFormValues, FamilyTraditionTab } from '@/types/family-tradition.types'
import { handleApiError } from '@/helpers/error.helpers'
import type { AnnouncementFormValues } from '@/types/announcement.types'
import { useRoute, useRouter } from 'vue-router'
import { AlertService } from '@/services/alert.service'

export const useHome = () => {
  const $route = useRoute()
  const $router = useRouter()
  const message = useMessage()
  const generalStore = useGeneralStore()
  const announcementStore = useAnnouncementStore()
  const familyTraditionStore = useFamilyTraditionStore()

  const loading = ref<string>('')
  const edited = ref<boolean>(false)

  const announcementParams = computed<PaginationParams>(() => announcementStore.params)
  const familyTraditionParams = computed<PaginationParams>(() => familyTraditionStore.params)
  const familyTraditionPath = computed<FamilyTraditionTab>(() => familyTraditionStore.path)

  const { refetch: refetchTraditions, isLoading: isLoadingTraditions } =
    useGetFamilyTraditionsQuery(familyTraditionParams, familyTraditionPath)
  const createFamilyTraditionMutation = useAddFamilyTraditionMutation()
  const updateFamilyTraditionMutation = useUpdateFamilyTraditionMutation()
  const deleteFamilyTraditionMutation = useDeleteFamilyTraditionMutation()

  const { refetch: refetchAnnouncements, isLoading: isLoadingAnnouncements } =
    useGetAnnouncementsQuery(announcementParams)
  const createAnnouncementMutation = useAddAnnouncementMutation()
  const updateAnnouncementMutation = useUpdateAnnouncementMutation()
  const deleteAnnouncementMutation = useDeleteAnnouncementMutation()

  const { refetch: refetchFamilyMembers } = useGetFamilyMembersQuery()

  const fetchAnnouncements = async () => {
    try {
      announcementStore.setStoreProp('loading', isLoadingAnnouncements.value)
      const response = await refetchAnnouncements()
      announcementStore.setStoreProp('announcements', response.data?.data || [])
    } catch (error) {
      announcementStore.setStoreProp('error', error)
    } finally {
      announcementStore.setStoreProp('loading', false)
    }
  }

  const fetchFamilyTraditions = async () => {
    try {
      familyTraditionStore.setStoreProp('loading', isLoadingTraditions.value)
      const response = await refetchTraditions()
      familyTraditionStore.setStoreProp('familyTraditions', response.data?.data || [])
    } catch (error) {
      familyTraditionStore.setStoreProp('error', error)
    } finally {
      familyTraditionStore.setStoreProp('loading', false)
    }
  }

  const createFamilyTradition = async (data: FamilyTraditionFormValues) => {
    loading.value = 'creating family tradition...'
    try {
      $route.query.fid
        ? await familyTraditionUpdate(Number($route.query.fid), data)
        : await familyTraditionCreation(data)
      await fetchFamilyTraditions()
      const query = { ...$route.query }
      delete query.fid
      delete query.ftype
      $router.replace({ name: 'App.HomeView', query: query })
      AlertService.success({
        subject: edited.value ? 'Updated Family Tradition Sent' : 'Family Tradition Sent',
        message: 'Members of this family tradition will receive a notification.',
        showIcon: true,
        imageUrl: 'images/success.png',
        closable: true,
        closablePosition: 'left',
        showCancelButton: false,
      })
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = ''
    }
  }

  const announcementCreation = async (data: AnnouncementFormValues) => {
    edited.value = false
    const response = await createAnnouncementMutation.mutateAsync(data)
    message.success(response?.message || 'Announcement created successfully')
  }

  const announcementUpdate = async (id: number, data: AnnouncementFormValues) => {
    edited.value = false
    const response = await updateAnnouncementMutation.mutateAsync({ id, data })
    message.success(response?.message || 'Announcement updated successfully')
    edited.value = true
  }

  const createAnnouncement = async (data: AnnouncementFormValues) => {
    loading.value = 'creating announcement...'
    try {
      $route.query.fid
        ? await announcementUpdate(Number($route.query.fid), data)
        : await announcementCreation(data)
      await fetchAnnouncements()

      const query = { ...$route.query }
      delete query.fid
      delete query.ftype
      $router.replace({ name: 'App.HomeView', query: query })
      AlertService.success({
        subject: edited.value ? 'Updated Announcement Sent' : 'Announcement Sent',
        message: 'Members of this announcement will receive a notification.',
        showIcon: true,
        imageUrl: 'images/success.png',
        closable: true,
        closablePosition: 'left',
        showCancelButton: false,
      })
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = ''
    }
  }

  const deleteAnnouncement = async (id: number) => {
    AlertService.confirm({
      subject: 'Delete Announcement',
      message:
        'Are you sure you want to Delete this announcement?<br /> We would remove it from the notification of other <br /> users',
      showIcon: true,
      iconName: 'delete',
      iconColor: 'white',
      iconWrapperClass: 'bg-red-500! rounded-full! p-3!',
      iconSize: 19,
      closable: true,
      closablePosition: 'left',
      showCancelButton: false,
      confirmButtonText: 'Delete Announcement',
      buttonConfig: {
        confirm: {
          text: 'Delete Announcement',
          primary: false,
          action: async () => {
            await announcementDeletion(id)
            await fetchAnnouncements()
          },
        },
      },
      customClass: {
        confirmButton:
          'bg-red-300! text-red-500! hover:bg-red-400! hover:text-red-700! h-13! rounded-2xl! hover:border-transparent!',
      },
    })
  }

  const deleteFamilyTradition = async (id: number) => {
    AlertService.confirm({
      subject: 'Delete Family Tradition',
      message:
        'Are you sure you want to Delete this family tradition?<br /> We would remove it from the notification of other <br /> users',
      showIcon: true,
      iconName: 'delete',
      iconColor: 'white',
      iconWrapperClass: 'bg-red-500! rounded-full! p-3!',
      iconSize: 19,
      closable: true,
      closablePosition: 'left',
      showCancelButton: false,
      confirmButtonText: 'Delete Family Tradition',
      buttonConfig: {
        confirm: {
          text: 'Delete Family Tradition',
          primary: false,
          action: async () => {
            await familyTraditionDeletion(id)
            await fetchFamilyTraditions()
          },
        },
      },
      customClass: {
        confirmButton:
          'bg-red-300! text-red-500! hover:bg-red-400! hover:text-red-700! h-13! rounded-2xl! hover:border-transparent!',
      },
    })
  }

  const familyTraditionDeletion = async (id: number) => {
    try {
      const response = await deleteFamilyTraditionMutation.mutateAsync({ id })
      message.success(response?.message || 'Family tradition deleted successfully')
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = ''
    }
  }

  const familyTraditionUpdate = async (id: number, data: FamilyTraditionFormValues) => {
    edited.value = false
    const response = await updateFamilyTraditionMutation.mutateAsync({ id, data })
    message.success(response?.message || 'Family tradition updated successfully')
    edited.value = true
  }

  const familyTraditionCreation = async (data: FamilyTraditionFormValues) => {
    edited.value = false
    const response = await createFamilyTraditionMutation.mutateAsync(data)
    message.success(response?.message || 'Family tradition created successfully')
    edited.value = true
  }

  const announcementDeletion = async (id: number) => {
    try {
      const response = await deleteAnnouncementMutation.mutateAsync(id)
      message.success(response?.message || 'Announcement deleted successfully')
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = ''
    }
  }

  const fetchFamilyMembers = async () => {
    const response = await refetchFamilyMembers()
    generalStore.setStoreProp('familyMembers', response.data?.data || [])
  }

  watch(announcementParams, async () => await fetchAnnouncements(), { deep: true })

  watch(familyTraditionPath, async () => await fetchFamilyTraditions())
  watch(familyTraditionParams, async () => await fetchFamilyTraditions(), { deep: true })

  return {
    loading,
    fetchAnnouncements,
    fetchFamilyTraditions,
    fetchFamilyMembers,
    createFamilyTradition,
    createAnnouncement,
    deleteAnnouncement,
    deleteFamilyTradition,
  }
}
