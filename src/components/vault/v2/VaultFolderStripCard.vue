<template>
  <div
    class="relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-2xl border border-neutral-200/80 bg-[#FFF8F0] p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    @click="handleClick"
  >
    <div class="absolute top-2 right-1 z-10">
      <n-dropdown :options="options" @select="onDropdownSelect">
        <n-button text type="tertiary" @click.stop.prevent>
          <MlbIcon name="vuesax.linear.more" :size="18" color="#737373" />
        </n-button>
      </n-dropdown>
    </div>
    <div class="flex justify-center pt-1 pb-2">
      <img
        src="@/assets/images/folder-filled.png"
        alt=""
        class="h-16 w-auto object-contain pointer-events-none"
      />
    </div>
    <div class="flex items-start gap-2 mt-1">
      <MlbIcon name="vuesax.linear.lock" :size="14" class="text-[#1B5E20] shrink-0 mt-0.5" />
      <div class="min-w-0 flex-1 pr-6">
        <p class="text-sm font-semibold text-neutral-900 truncate">{{ folder.title }}</p>
        <p class="text-xs text-neutral-500 mt-0.5">
          {{ fileCount }} {{ fileCount === 1 ? 'file' : 'files' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NButton, NDropdown } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useVault } from '@/composables/useVault'
import { useArchive } from '@/composables/useArchive'
import { AlertService } from '@/services/alert.service'
import VaultPinForm from '@/components/vault/VaultPinForm.vue'
import type { FolderInterface } from '@/types/vault.types'
import { useMediaQuery } from '@vueuse/core'
import { useVaultStore } from '@/stores/vault.store'

const props = defineProps<{
  folder: FolderInterface
}>()

const emit = defineEmits<{
  (
    e: 'folder-menu',
    value: { key: string; folder: FolderInterface },
  ): void
}>()

const $route = useRoute()
const $router = useRouter()
const vaultStore = useVaultStore()
const { loading, fetchVaultFolder } = useVault()
const { setSelectedFolder, deleteArchiveFolder } = useArchive()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const fileCount = computed(() => props.folder.attachments?.length ?? 0)

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

const handleClick = () => {
  setSelectedFolder(props.folder)
  $router.push({
    name: 'App.VaultFolderView',
    params: { ...$route.params },
    query: { action: 'verify-pin' },
  })
}

const onDropdownSelect = (key: string) => {
  handleSelect(key)
}

const handleSelect = (key: string) => {
  setSelectedFolder(props.folder)
  const action: Record<string, () => void> = {
    edit: () => {
      vaultStore.setStoreProp('edit', true)
    },
    'add-media': () => {
      $router.push({
        name: $route.name,
        params: { ...$route.params, id: String(props.folder.id) },
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
    delete: () => deleteArchiveFolder(props.folder.id),
  }

  const executeAction = () => {
    action[key]?.()
    emit('folder-menu', { key, folder: props.folder })
  }

  verifyPin(executeAction)
}

const verifyPin = (postVerificationAction: () => void) => {
  AlertService.alert({
    subject: 'Enter Vault PIN',
    message: 'Enter the PIN to your vault',
    closable: true,
    showIcon: false,
    closablePosition: 'left',
    fullPageAlert: !isLargeScreen.value,
    textAlign: !isLargeScreen.value ? 'left' : 'center',
    html: h(VaultPinForm, {
      loading: loading.value,
      onPinSubmitted: async (value: string) =>
        await handlePinVerification(value, postVerificationAction),
    }),
    showCancelButton: false,
    showConfirmButton: false,
  })
}

const handlePinVerification = async (value: string, postVerificationAction: () => void) => {
  if (!value) return
  await fetchVaultFolder(props.folder.id, value)
  AlertService.close()
  postVerificationAction()
}
</script>
