import { h, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useVaultStore } from '@/stores/vault.store'
import {
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetVaultFoldersQuery,
  useCreateVaultFolderMutation,
  useUpdateVaultPinMutation,
  useGetVaultFolderMutation,
  useDeleteVaultMediaMutation,
} from '@/services/vault.services'
import type { MaybeRefOrGetter } from 'vue'
import { AlertService, useAlertState } from '@/services/alert.service'
import { handleApiError } from '@/helpers/error.helpers'
import VaultPinForm from '@/components/vault/VaultPinForm.vue'
import type { CreateFolderValues, CreateFilesValues } from '@/types/vault.types'
import { useMediaQuery } from '@vueuse/core'

export const useVault = (queryEnabled: MaybeRefOrGetter<boolean> = true) => {
  const message = useMessage()
  const alertState = useAlertState()
  const vaultStore = useVaultStore()
  const updateFolderMutation = useUpdateFolderMutation()
  const deleteFolderMutation = useDeleteFolderMutation()
  const createFolderMutation = useCreateVaultFolderMutation()
  const getVaultFolderMutation = useGetVaultFolderMutation()
  const updateVaultPinMutation = useUpdateVaultPinMutation()
  const getVaultFoldersQuery = useGetVaultFoldersQuery(queryEnabled)
  const deleteVaultMediaMutation = useDeleteVaultMediaMutation()
  const isLargeScreen = useMediaQuery('(min-width: 768px)')

  const loading = computed(
    () =>
      createFolderMutation.isPending.value ||
      updateFolderMutation.isPending.value ||
      updateVaultPinMutation.isPending.value ||
      getVaultFolderMutation.isPending.value,
  )

  const fileUploading = computed(() => updateFolderMutation.isPending.value)
  const pinStep = computed(() => vaultStore.pinStep)
  const pinSubject = computed(() =>
    pinStep.value === 0
      ? 'Enter your current pin'
      : pinStep.value === 1
        ? 'Create Vault PIN'
        : 'Confirm Vault PIN',
  )

  const pinMessage = computed(() =>
    pinStep.value === 0
      ? 'Provide your current PIN to continue.'
      : pinStep.value === 1
        ? 'This is the PIN you will use to access your vault. Please enter a PIN.'
        : pinStep.value === 2
          ? 'This is the PIN you will use to access your vault. Please enter a PIN.'
          : '',
  )

  // Watch pinStep and update alert subject reactively
  watch(pinStep, () => {
    if (alertState.value.config && alertState.value.show) {
      alertState.value.config.subject = pinSubject.value
    }
  })

  const vaultFolderCreation = async (data: CreateFolderValues) => {
    try {
      let response = null
      await AlertService.alert({
        subject: pinSubject.value,
        message: 'This is the PIN you will use to access your vault. Please enter a PIN.',
        closable: true,
        showIcon: false,
        closablePosition: 'left',
        fullPageAlert: !isLargeScreen.value,
        textAlign: !isLargeScreen.value ? 'left' : 'center',
        html: h(VaultPinForm, {
          loading: updateVaultPinMutation.isPending.value,
          hasConfirmation: true,
          onPinSubmitted: (value: string | { current_pin: string; pin: string }) =>
            (response = createFolderMutation.mutateAsync({
              ...data,
              pin: typeof value === 'string' ? value : value.pin,
            } as CreateFolderValues))
              .then((response) => {
                message.success(response?.message || 'Folder created successfully')
                AlertService.close()
              })
              .catch((error) => {
                handleApiError(error, message)
              }),
        }),
        onClose: () => {
          vaultStore.setStoreProp('pinStep', 1)
        },
        showCancelButton: false,
        showConfirmButton: false,
      })
      AlertService.close()
      return response
    } catch (error) {
      handleApiError(error, message)
      throw error
    }
  }

  const handleChangePin = async () => {
    try {
      vaultStore.setStoreProp('pinStep', 0)
      let response = null
      await AlertService.alert({
        subject: pinSubject.value,
        message: pinMessage.value,
        closable: true,
        showIcon: false,
        closablePosition: 'left',
        fullPageAlert: !isLargeScreen.value,
        textAlign: !isLargeScreen.value ? 'left' : 'center',
        html: h(VaultPinForm, {
          loading: updateVaultPinMutation.isPending.value,
          hasConfirmation: true,
          hasCurrentPin: true,
          onPinChanged: (value: { current_pin: string; pin: string }) =>
            (response = updateVaultPinMutation.mutateAsync({
              current_pin: value.current_pin,
              new_pin: value.pin,
              id: vaultStore.selectedFolder?.id as number,
            }))
              .then((response) => {
                message.success(response?.message || 'PIN changed successfully')
                AlertService.close()
              })
              .catch((error) => {
                handleApiError(error, message)
              }),
        }),
        onClose: () => {
          vaultStore.setStoreProp('pinStep', 1)
        },
        showCancelButton: false,
        showConfirmButton: false,
      })
      return response
    } catch (error) {
      handleApiError(error, message)
      throw error
    }
  }

  const fetchVaultFolders = async () => {
    vaultStore.setStoreProp('foldersLoading', true)
    try {
      const response = await getVaultFoldersQuery.refetch()
      vaultStore.setStoreProp('folders', response.data?.data || [])
    } catch (error) {
      handleApiError(error, message)
    } finally {
      vaultStore.setStoreProp('foldersLoading', false)
    }
  }

  const fetchVaultFolder = async (id: number, pin: string) => {
    try {
      const response = await getVaultFolderMutation.mutateAsync({ id, pin })
      vaultStore.setStoreProp('selectedFolder', response.data || null)
    } catch (error) {
      handleApiError(error, message)
    }
  }

  const vaultFolderUpdate = async (data: CreateFolderValues | CreateFilesValues) => {
    try {
      const id = vaultStore.selectedFolder?.id as number

      return await updateFolderMutation.mutateAsync({ folder: data, id })
    } catch (error) {
      handleApiError(error, message)
      throw error
    }
  }

  const handleCreateFolder = async (data: CreateFolderValues | CreateFilesValues) => {
    let response
    if (vaultStore.selectedFolder) {
      response = await vaultFolderUpdate(data)
    } else {
      response = await vaultFolderCreation(data as CreateFolderValues)
    }
    await fetchVaultFolders()
    return { ...(response || {}), key: vaultStore.selectedFolder ? 'edit' : 'create' }
  }

  const deleteVaultFolder = async (id: number) => {
    AlertService.confirm({
      subject: `Confirm you want delete ${vaultStore.selectedFolder?.title} folder?`,
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
            vaultStore.setStoreProp('selectedFolder', null)
            await handleDeleteFolder(id)
            await fetchVaultFolders()
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

  const handleDeleteMedia = async (mediaIds: number[]) => {
    try {
      for (const mediaId of mediaIds) {
        await deleteVaultMediaMutation.mutateAsync({
          id: vaultStore.selectedFolder?.id as number,
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
    vaultStore,
    fileUploading,
    handleChangePin,
    fetchVaultFolder,
    deleteVaultFolder,
    handleCreateFolder,
    fetchVaultFolders,
    handleDeleteMedia,
  }
}
