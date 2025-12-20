<template>
  <!-- Mobile Layout (Horizontal) -->
  <div
    class="md:hidden bg-white rounded-2xl p-3 cursor-pointer hover:shadow-md transition-shadow"
    @click="handleClick"
  >
    <div class="flex items-center justify-between gap-3">
      <!-- Folder Icon -->
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <img
            src="@/assets/images/folder-filled.png"
            alt="Folder Image"
            class="w-14 h-14 object-contain"
          />
        </div>
        <div class="mb-1">
          <h3 class="font-semibold text-base text-gray-900 truncate">
            {{ _folder?.name }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ _folder?.files_count?.toLocaleString() }}
            {{ _folder?.files_count !== 1 ? 'files' : 'file' }}
          </p>
        </div>
      </div>

      <!-- Content Section -->
      <div class="min-w-0 flex">
        <div>
          <!-- Visibility Badge -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <div
              class="w-2 h-2 rounded-full"
              :class="_folder?.visibility === 'public' ? 'bg-green-600' : 'bg-gray-500'"
            ></div>
            <span
              class="text-xs font-medium capitalize"
              :class="_folder?.visibility === 'public' ? 'text-green-600' : 'text-gray-500'"
            >
              {{ _folder?.visibility }}
            </span>
          </div>
          <!-- Avatars -->
          <div
            v-if="_folder?.members && _folder?.members.length > 0"
            class="flex items-center justify-end"
          >
            <MlbAvatar
              :options="{
                firstname_field: _folder?.firstname_field,
                lastname_field: _folder?.lastname_field,
                src_field: _folder?.src_field,
                users: _folder?.members,
              }"
              :max="3"
              :size="28"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Desktop Layout (Vertical) -->
  <div
    class="folder-card hidden md:block p-2 cursor-pointer relative hover:shadow-sm rounded-2xl"
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
        {{ _folder?.files_count?.toLocaleString() }}
        {{ _folder?.files_count !== 1 ? 'files' : 'file' }}
      </span>

      <!-- Visibility Status -->
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="_folder?.visibility === 'public' ? 'bg-primary-700' : 'bg-gray-500'"
        />
        <span
          class="text-xs capitalize"
          :class="_folder?.visibility === 'public' ? 'text-primary-700' : 'text-gray-500'"
        >
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
  heritageVault?: boolean
  onClick?: () => void
  onMenuClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  folder: null,
  heritageVault: false,
})

const $emit = defineEmits<{
  (e: 'click:folder', value: { flow: string; id?: number }): void
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

// const pinVerified = ref<boolean>(false)

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
  if (!props.heritageVault) {
    if (currentFlow.value === 'vault') {
      $router.push({
        name: routeName,
        params: { ...$route.params },
        query: { action: 'verify-pin' },
      })
    } else {
      $router.push({ name: routeName, params: { ...$route.params, id: props.folder?.id } })
    }
  }
  $emit('click:folder', { flow: currentFlow.value, id: props.folder?.id })
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
