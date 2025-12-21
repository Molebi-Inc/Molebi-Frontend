import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useVault } from '@/composables/useVault'
import { useVaultStore } from '@/stores/vault.store'
import { useStorage } from '@/composables/useStorage'
import { useStorageStore } from '@/stores/storage.store'
import { useGeneralStore } from '@/stores/general.store'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { FamilyMediaFormValues } from '@/types/family-tradition.types'
import type { CreateFilesValues, CreateFolderValues, FolderInterface } from '@/types/vault.types'

export const useArchive = () => {
  const $route = useRoute()
  const vaultStore = useVaultStore()
  const storageStore = useStorageStore()
  const generalStore = useGeneralStore()
  const currentFlow = computed(() => ($route.meta.flow as 'vault' | 'storage') || generalStore.flow)

  // Initialize both composables, but only enable queries for the current flow
  const vault = useVault(computed(() => currentFlow.value === 'vault'))
  const storage = useStorage(computed(() => currentFlow.value === 'storage'))

  const loading = computed(() =>
    currentFlow.value === 'vault' ? vault.loading.value : storage.loading.value,
  )

  const folderMediaLoading = computed(() =>
    currentFlow.value === 'vault' ? false : storageStore.folderMediaLoading,
  )

  const foldersLoading = computed(() =>
    currentFlow.value === 'vault' ? vaultStore.foldersLoading : storageStore.foldersLoading,
  )

  const archiveExist = computed(() =>
    currentFlow.value === 'vault' ? vaultStore.selectedFolder : storageStore.selectedFolder,
  )

  const fileUploading = computed(() =>
    currentFlow.value === 'vault' ? vault.fileUploading.value : storage.fileUploading.value,
  )

  const setSelectedFolder = (folder: FolderInterface | StorageFolderInterface | null) => {
    if (currentFlow.value === 'vault') {
      vaultStore.setStoreProp('selectedFolder', folder)
    } else {
      storageStore.setStoreProp('selectedFolder', folder)
    }
  }

  const handleArchiveMutation = async (data: CreateFolderValues) => {
    const response =
      currentFlow.value === 'vault'
        ? await vault.handleCreateFolder(data)
        : await storage.handleCreateFolder(data)
    setSelectedFolder(null)
    return response
  }

  const fetchArchiveFolders = async () => {
    return currentFlow.value === 'vault'
      ? await vault.fetchVaultFolders()
      : await storage.fetchStorageFolders()
  }

  const deleteArchiveFolder = async (id: number) => {
    const response =
      currentFlow.value === 'vault'
        ? await vault.deleteVaultFolder(id)
        : await storage.deleteStorageFolder(id)
    return response
  }

  const handleFileCreation = async (data: FamilyMediaFormValues | CreateFilesValues) => {
    switch (currentFlow.value) {
      case 'vault':
        return await vault.handleCreateFolder(data as CreateFilesValues)
      case 'storage':
        return await storage.handleCreateFile(data as FamilyMediaFormValues)
      default:
        throw new Error('Invalid route name')
    }
  }

  const fetchFolderMedia = async () => {
    const media =
      currentFlow.value === 'vault'
        ? vaultStore.selectedFolder?.attachments || []
        : await storage.fetchFolderMedia()
    return media
  }

  const clearFolderMedia = () => {
    if (currentFlow.value === 'storage') {
      storageStore.setStoreProp('folderMedia', [])
    }
  }

  const fetchFolderDetails = async () => {
    return currentFlow.value === 'storage'
      ? await storage.fetchStorageFolder()
      : vault.fetchVaultFolder(vaultStore.selectedFolder?.id as number, vaultStore.pin as string)
  }

  const handleDeleteMedia = async (mediaIds: number[]) => {
    if (currentFlow.value === 'vault') {
      await vault.handleDeleteMedia(mediaIds)
    } else {
      await storage.handleDeleteMedia(mediaIds)
    }
    await fetchFolderDetails()
    await fetchFolderMedia()
  }

  return {
    loading,
    currentFlow,
    archiveExist,
    foldersLoading,
    folderMediaLoading,
    handleFileCreation,
    setSelectedFolder,
    fetchArchiveFolders,
    deleteArchiveFolder,
    handleArchiveMutation,
    fetchFolderMedia,
    clearFolderMedia,
    fetchFolderDetails,
    fileUploading,
    handleDeleteMedia,
  }
}
