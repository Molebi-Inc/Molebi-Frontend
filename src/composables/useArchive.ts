import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useVault } from '@/composables/useVault'
import { useStorage } from '@/composables/useStorage'
import { useVaultStore } from '@/stores/vault.store'
import { useStorageStore } from '@/stores/storage.store'
import type { CreateFolderValues, FolderInterface } from '@/types/vault.types'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { FamilyMediaFormValues } from '@/types/family-tradition.types'

export const useArchive = () => {
  const $route = useRoute()
  const vaultStore = useVaultStore()
  const storageStore = useStorageStore()
  const currentFlow = computed(() => $route.meta.flow as 'vault' | 'storage')

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

  const setSelectedFolder = (folder: FolderInterface | StorageFolderInterface | null) => {
    currentFlow.value === 'vault'
      ? vaultStore.setStoreProp('selectedFolder', folder)
      : storageStore.setStoreProp('selectedFolder', folder)
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
    setSelectedFolder(null)
    return response
  }

  const handleFileCreation = async (data: FamilyMediaFormValues | CreateFolderValues) => {
    // let response
    switch ($route.name) {
      case 'App.VaultFolderView':
        return await vault.handleCreateFolder(data as CreateFolderValues)
      case 'App.StorageFolderView':
        return await storage.handleCreateFile(data as FamilyMediaFormValues)
      default:
        throw new Error('Invalid route name')
    }
  }

  const fetchFolderMedia = async () => {
    const media =
      currentFlow.value === 'vault'
        ? //  ? await vault.fetchFolderMedia()
          vaultStore.selectedFolder?.attachments || []
        : await storage.fetchFolderMedia()
    return media
  }

  const clearFolderMedia = () => {
    currentFlow.value === 'storage' ? storageStore.setStoreProp('folderMedia', []) : null
  }

  const fetchFolderDetails = async () => {
    return currentFlow.value === 'storage' ? await storage.fetchStorageFolder() : null
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
  }
}
