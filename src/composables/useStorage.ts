import { computed } from 'vue'
import { useMessage } from 'naive-ui'
import {
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetStorageFoldersQuery,
  useAddFilesMutation,
  useGetFolderMediaQuery,
  useGetStorageFolderQuery,
  useDeleteStorageMediaMutation,
} from '@/services/storage.services'
import { useRoute } from 'vue-router'
import type { MaybeRefOrGetter } from 'vue'
import { AlertService } from '@/services/alert.service'
import { useStorageStore } from '@/stores/storage.store'
import { handleApiError } from '@/helpers/error.helpers'
import type { CreateFolderValues } from '@/types/vault.types'
import type { FamilyMediaFormValues } from '@/types/family-tradition.types'

export const useStorage = (queryEnabled: MaybeRefOrGetter<boolean> = true) => {
  const $route = useRoute()
  const message = useMessage()
  const storageStore = useStorageStore()
  const addFilesMutation = useAddFilesMutation()
  const createFolderMutation = useCreateFolderMutation()
  const updateFolderMutation = useUpdateFolderMutation()
  const deleteFolderMutation = useDeleteFolderMutation()
  const deleteStorageMediaMutation = useDeleteStorageMediaMutation()

  // Safely convert route.params.id to a number
  const routeFolderId = computed(() => {
    const id = $route.params.id
    if (!id || Array.isArray(id)) return null
    const numId = Number(id)
    return Number.isNaN(numId) ? null : numId
  })

  // Query for storage folder - reactive to route changes
  const getStorageFolderQuery = useGetStorageFolderQuery(
    computed(
      () => queryEnabled && !!routeFolderId.value && $route.name === 'App.StorageFolderView',
    ),
    routeFolderId,
  )

  const getFolderMediaQuery = useGetFolderMediaQuery(
    computed(
      () => queryEnabled && !!routeFolderId.value && $route.name === 'App.StorageFolderView',
    ),
    routeFolderId,
  )

  const { refetch: refetchStorageFolders } = useGetStorageFoldersQuery(queryEnabled)
  const loading = computed(
    () => createFolderMutation.isPending.value || updateFolderMutation.isPending.value,
  )
  const fileUploading = computed(() => addFilesMutation.isPending.value)

  const storageFolderCreation = async (data: CreateFolderValues) => {
    try {
      return await createFolderMutation.mutateAsync(data)
    } catch (error) {
      handleApiError(error, message)
      throw error
    }
  }

  const fetchStorageFolder = async () => {
    const response = await getStorageFolderQuery.refetch()
    storageStore.setStoreProp('selectedFolder', response.data?.data || null)
    return response
  }

  const fetchStorageFolders = async () => {
    storageStore.setStoreProp('foldersLoading', true)
    try {
      const response = await refetchStorageFolders()
      storageStore.setStoreProp('folders', response.data?.data || [])
    } catch (error) {
      handleApiError(error, message)
    } finally {
      storageStore.setStoreProp('foldersLoading', false)
    }
  }

  const storageFolderUpdate = async (data: CreateFolderValues) => {
    try {
      const id = storageStore.selectedFolder?.id as number

      return await updateFolderMutation.mutateAsync({ folder: data, id })
    } catch (error) {
      handleApiError(error, message)
      throw error
    }
  }

  const handleCreateFolder = async (data: CreateFolderValues) => {
    let response
    if (storageStore.selectedFolder) {
      response = await storageFolderUpdate(data)
    } else {
      response = await storageFolderCreation(data)
    }
    await fetchStorageFolders()
    return { ...(response || {}), key: storageStore.selectedFolder ? 'edit' : 'create' }
  }

  const deleteStorageFolder = async (id: number) => {
    AlertService.confirm({
      subject: `Confirm you want delete ${storageStore.selectedFolder?.name} folder?`,
      message:
        'This action will erase the folder and all the <br /> media files you have saved in it.',
      showIcon: true,
      iconName: 'delete',
      iconColor: 'white',
      iconWrapperClass: 'bg-red-500! rounded-full! p-3!',
      iconSize: 19,
      closable: true,
      closablePosition: 'left',
      showCancelButton: false,
      confirmButtonText: 'Delete',
      buttonConfig: {
        confirm: {
          text: 'Delete',
          primary: false,
          action: async () => {
            storageStore.setStoreProp('selectedFolder', null)
            await handleDeleteFolder(id)
            await fetchStorageFolders()
          },
        },
      },
      customClass: {
        confirmButton:
          'bg-red-300! text-red-500! hover:bg-red-400! hover:text-red-700! h-13! rounded-2xl! hover:border-transparent!',
      },
    })
  }

  const handleDeleteFolder = async (id: number) => {
    try {
      const response = await deleteFolderMutation.mutateAsync({ id })
      message.success(response?.message || 'Folder deleted successfully')
    } catch (error) {
      handleApiError(error, message)
    }
  }

  const handleCreateFile = async (data: FamilyMediaFormValues) => {
    const response = await addFilesMutation.mutateAsync({
      id: storageStore.selectedFolder?.id as number,
      data,
    })
    await fetchFolderMedia()
    return response
  }

  const fetchFolderMedia = async () => {
    storageStore.setStoreProp('folderMediaLoading', true)
    const response = await getFolderMediaQuery.refetch()
    storageStore.setStoreProp('folderMedia', response.data?.data || [])
    storageStore.setStoreProp('folderMediaLoading', false)
    return response
  }

  const handleDeleteMedia = async (mediaIds: number[]) => {
    try {
      for (const mediaId of mediaIds) {
        await deleteStorageMediaMutation.mutateAsync({
          id: storageStore.selectedFolder?.id as number,
          mediaId,
        })
      }
      message.success('Media deleted successfully')
    } catch (error) {
      handleApiError(error, message)
    }
  }

  return {
    loading,
    storageStore,
    fileUploading,
    fetchStorageFolder,
    deleteStorageFolder,
    handleCreateFolder,
    fetchStorageFolders,
    fetchFolderMedia,
    handleCreateFile,
    handleDeleteMedia,
  }
}
