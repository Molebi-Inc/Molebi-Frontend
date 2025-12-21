import { ref, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useVault } from '@/composables/useVault'
import { useArchive } from '@/composables/useArchive'
import { AlertService } from '@/services/alert.service'
import type { FolderInterface } from '@/types/vault.types'
import VaultPinForm from '@/components/vault/VaultPinForm.vue'
import type { StorageFolderInterface } from '@/types/storage.types'
import { useMediaQuery } from '@vueuse/core'

export const useFolderMenu = () => {
  const $route = useRoute()
  const $router = useRouter()
  const { deleteArchiveFolder } = useArchive()
  const { loading, fetchVaultFolder } = useVault()
  const { currentFlow, setSelectedFolder } = useArchive()
  const isLargeScreen = useMediaQuery('(min-width: 768px)')
  // const $emit = defineEmits<{
  //   (
  //     e: 'select:option',
  //     value: { key: string; folder: FolderInterface | StorageFolderInterface },
  //   ): void
  // }>()
  const options = ref([
    {
      label: 'Edit',
      key: 'edit',
      icon: () => h(MlbIcon, { name: 'vuesax.linear.edit-2', size: 12, color: '#737373' }),
    },
    {
      label: 'Share',
      key: 'share',
      icon: () => h(MlbIcon, { name: 'vuesax.linear.share', size: 12, color: '#737373' }),
    },
    {
      label: 'Add media',
      key: 'add-media',
      icon: () => h(MlbIcon, { name: 'vuesax.linear.add', size: 12, color: '#737373' }),
    },
    {
      label: 'Delete',
      key: 'delete',
      icon: () => h(MlbIcon, { name: 'delete', size: 12, color: '#C20000' }),
    },
  ])

  const handleSelect = (key: string, folder: FolderInterface | StorageFolderInterface) => {
    setSelectedFolder(folder)
    const action = {
      edit: () => {
        $router.push({
          name: $route.name,
          params: { ...$route.params, id: folder.id },
          query: { ...$route.query },
        })
      },
      'add-media': () => {
        $router.push({
          name: $route.name,
          params: { ...$route.params, id: folder.id },
          query: { ...$route.query, tab: 'file' },
        })
      },
      share: () => {
        $router.push({
          name: $route.name,
          params: { ...$route.params },
          query: { ...$route.query, action: 'share' },
        })
      },
      delete: () => deleteArchiveFolder(folder.id as number),
    }

    const executeAction = () => {
      action[key as keyof typeof action]()
      // $emit('select:option', {
      //   key,
      //   folder,
      // })
    }

    if (currentFlow.value === 'vault') {
      verifyPin(folder, executeAction)
    } else {
      executeAction()
    }
  }

  const verifyPin = (
    folder: FolderInterface | StorageFolderInterface,
    postVerificationAction: () => void,
  ) => {
    AlertService.alert({
      subject: 'Enter Vault PIN',
      closable: true,
      showIcon: false,
      closablePosition: 'left',
      fullPageAlert: !isLargeScreen.value,
      textAlign: !isLargeScreen.value ? 'left' : 'center',
      html: h(VaultPinForm, {
        loading: loading.value,
        onPinSubmitted: async (value: string) =>
          await handlePinVerification(value, folder, postVerificationAction),
      }),
      showCancelButton: false,
      showConfirmButton: false,
    })
  }

  const handlePinVerification = async (
    value: string,
    folder: FolderInterface | StorageFolderInterface,
    postVerificationAction: () => void,
  ) => {
    if (!value) return
    await fetchVaultFolder(folder.id as number, value)
    AlertService.close()
    postVerificationAction()
  }
  return {
    options,
    handleSelect,
  }
}
