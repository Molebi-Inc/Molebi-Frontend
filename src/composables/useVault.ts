import { h, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { useVaultStore } from '@/stores/vault.store'
import {
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetVaultFoldersQuery,
  useCreateVaultFolderMutation,
  useUpdateVaultPinMutation,
  useGetVaultFolderMutation,
} from '@/services/vault.services'
import type { MaybeRefOrGetter } from 'vue'
import { AlertService } from '@/services/alert.service'
import { handleApiError } from '@/helpers/error.helpers'
import type { CreateFolderValues } from '@/types/vault.types'
import VaultPinForm from '@/components/vault/VaultPinForm.vue'

export const useVault = (queryEnabled: MaybeRefOrGetter<boolean> = true) => {
  const message = useMessage()
  const vaultStore = useVaultStore()
  const updateFolderMutation = useUpdateFolderMutation()
  const deleteFolderMutation = useDeleteFolderMutation()
  const createFolderMutation = useCreateVaultFolderMutation()
  const getVaultFolderMutation = useGetVaultFolderMutation()
  const updateVaultPinMutation = useUpdateVaultPinMutation()
  const getVaultFoldersQuery = useGetVaultFoldersQuery(queryEnabled)

  const loading = computed(
    () =>
      createFolderMutation.isPending.value ||
      updateFolderMutation.isPending.value ||
      getVaultFolderMutation.isPending.value,
  )

  const vaultFolderCreation = async (data: CreateFolderValues) => {
    try {
      const response = await createFolderMutation.mutateAsync(data)
      AlertService.alert({
        subject: 'Set Vault PIN',
        closable: true,
        showIcon: false,
        closablePosition: 'left',
        html: h(VaultPinForm, {
          loading: updateVaultPinMutation.isPending.value,
          onPinSubmitted: (value: string) =>
            updateVaultPinMutation.mutateAsync({
              current_pin: '0000',
              new_pin: value,
              id: response.data?.id as number,
            }),
        }),
        showCancelButton: false,
        showConfirmButton: false,
      })
      return response
    } catch (error) {
      handleApiError(error, message)
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

  const vaultFolderUpdate = async (data: CreateFolderValues) => {
    try {
      const id = vaultStore.selectedFolder?.id as number

      return await updateFolderMutation.mutateAsync({ folder: data, id })
    } catch (error) {
      handleApiError(error, message)
    }
  }

  const handleCreateFolder = async (data: CreateFolderValues) => {
    let response
    if (vaultStore.selectedFolder) {
      response = await vaultFolderUpdate(data)
    } else {
      response = await vaultFolderCreation(data)
    }
    await fetchVaultFolders()
    return response
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

  return {
    loading,
    vaultStore,
    fetchVaultFolder,
    deleteVaultFolder,
    handleCreateFolder,
    fetchVaultFolders,
  }
}
