<template>
  <div
    class="folder-card p-1 md:p-2 cursor-pointer relative hover:shadow-sm rounded-2xl"
    @click="handleClick"
  >
    <div class="bg-[#F6F6F6] rounded-3xl p-4">
      <div class="flex items-center justify-end mb-1">
        <n-dropdown :options="options" @select="(key) => handleSelect(key)" class="z-10!">
          <n-button text type="tertiary" @click.stop.prevent="(e) => e?.stopPropagation()">
            <MlbIcon name="vuesax.linear.more" :size="20" color="#737373" />
          </n-button>
        </n-dropdown>
      </div>
      <div class="mb-4">
        <img src="@/assets/images/folder-filled.png" alt="Folder Image" class="object-cover" />
      </div>
      <div
        v-if="_folder?.members && _folder?.members.length > 0"
        class="flex items-center justify-center"
      >
        <MlbAvatar
          :options="{
            firstname_field: _folder?.firstname_field,
            lastname_field: _folder?.lastname_field,
            src_field: _folder?.src_field,
            users: _folder?.members,
          }"
          :max="5"
          :size="24"
        />
      </div>
    </div>
    <div class="mb-1 font-semibold mt-2 text-center">
      {{ _folder?.name }}
    </div>

    <!-- Bottom Section -->
    <div class="flex items-center justify-between">
      <!-- File Count -->
      <span class="text-xs font-medium text-gray-500">
        {{ _folder?.files_count !== 1 ? `${_folder?.files_count} files` : '1 file' }}
      </span>

      <!-- Visibility Status -->
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-primary-700" />
        <span class="text-xs text-primary-700">
          {{ _folder?.visibility }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NButton, NDropdown } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
import { useArchive } from '@/composables/useArchive'
import { AlertService } from '@/services/alert.service'
import type { FolderInterface } from '@/types/vault.types'
import VaultPinForm from '@/components/vault/VaultPinForm.vue'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { useVault } from '@/composables/useVault'

interface Props {
  folder: FolderInterface | StorageFolderInterface | null
  onClick?: () => void
  onMenuClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  folder: null,
})

const $emit = defineEmits<{
  (e: 'click:folder', value: { flow: string }): void
  (
    e: 'select:option',
    value: { key: string; folder: FolderInterface | StorageFolderInterface | null },
  ): void
  (e: 'menuClick'): void
}>()

const $route = useRoute()
const $router = useRouter()
const { currentFlow, setSelectedFolder, deleteArchiveFolder } = useArchive()
const { loading, fetchVaultFolder } = useVault()

const pinVerified = ref<boolean>(false)

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

const _folder = computed<{
  members: Partial<FamilyMemberInterface>[]
  name: string
  files_count: number
  visibility: string
  firstname_field: string
  lastname_field: string
  src_field: string
}>(() => {
  if (currentFlow.value === 'vault') {
    return {
      members: (props.folder as FolderInterface)?.viewers || [],
      name: (props.folder as FolderInterface)?.title,
      files_count: (props.folder as FolderInterface)?.attachments.length,
      visibility: (props.folder as FolderInterface)?.is_public ? 'public' : 'private',
      firstname_field: '',
      lastname_field: '',
      src_field: '',
    }
  } else {
    return {
      members: [(props.folder as StorageFolderInterface)?.creator],
      name: (props.folder as StorageFolderInterface)?.name,
      files_count: (props.folder as StorageFolderInterface)?.total_files,
      visibility: (props.folder as StorageFolderInterface)?.is_shared ? 'public' : 'private',
      firstname_field: 'name',
      lastname_field: '',
      src_field: '',
    }
  }
})

const handleClick = () => {
  setSelectedFolder(props.folder as FolderInterface | StorageFolderInterface)
  const routeName = currentFlow.value === 'vault' ? 'App.VaultFolderView' : 'App.StorageFolderView'
  if (currentFlow.value === 'vault') {
    $router.push({
      name: routeName,
      // params: { id: props.folder?.id },
      query: { action: 'verify-pin' },
    })
  } else {
    $router.push({ name: routeName, params: { id: props.folder?.id } })
  }
  $emit('click:folder', { flow: currentFlow.value })
  if (props.onClick) {
    props.onClick()
  }
}

const handleSelect = (key: string) => {
  setSelectedFolder(props.folder as FolderInterface | StorageFolderInterface)
  const action = {
    edit: () => {},
    'add-media': () => {
      $router.push({
        name: $route.name,
        params: { ...$route.params, id: props.folder?.id },
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
    delete: () => deleteArchiveFolder(props.folder?.id as number),
  }

  const executeAction = () => {
    action[key as keyof typeof action]()
    $emit('select:option', {
      key,
      folder: props.folder as FolderInterface | StorageFolderInterface,
    })
  }

  if (currentFlow.value === 'vault') {
    verifyPin(executeAction)
  } else {
    executeAction()
  }
}

const verifyPin = (postVerificationAction: () => void) => {
  AlertService.alert({
    subject: 'Enter Vault PIN',
    closable: true,
    showIcon: false,
    closablePosition: 'left',
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
  await fetchVaultFolder(props.folder?.id as number, value)
  AlertService.close()
  postVerificationAction()
}
</script>

<style scoped>
.folder-card {
  min-height: 200px;
}
</style>
