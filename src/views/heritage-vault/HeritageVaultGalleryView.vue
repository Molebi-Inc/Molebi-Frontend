<template>
  <section>
    <div class="py-4 flex items-center justify-between">
      <BackButton
        label=""
        icon="vuesax.linear.arrow-left"
        :previous-route="false"
        @update:go-back="handleGalleryBack"
      />
      <div>
        {{ _folder.name }}
      </div>
      <div>
        <n-dropdown
          :options="options"
          @select="
            (key) => initSelect(key, selectedFolder as FolderInterface | StorageFolderInterface)
          "
          class="z-10!"
        >
          <n-button
            text
            type="tertiary"
            size="small"
            @click.stop.prevent="(e) => e?.stopPropagation()"
            class="rotate-90"
          >
            <MlbIcon name="vuesax.linear.more" :size="20" color="#737373" />
          </n-button>
        </n-dropdown>
      </div>
    </div>
    <div class="flex items-center justify-between mt-6">
      <div
        :class="[
          'flex items-center gap-2 rounded-full px-2 py-1',
          _folder?.visibility === 'public' ? 'bg-primary-100' : 'bg-gray-100',
        ]"
      >
        <div
          class="w-2 h-2 rounded-full"
          :class="_folder?.visibility === 'public' ? 'bg-primary-700' : 'bg-gray-500'"
        />
        <span
          class="text-sm capitalize"
          :class="_folder?.visibility === 'public' ? 'text-primary-700' : 'text-gray-500'"
        >
          {{ _folder?.visibility }}
        </span>
      </div>
      <div>
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
      <div>
        <span class="text-sm font-medium text-gray-500">
          {{ _folder?.files_count?.toLocaleString() }}
          {{ _folder?.files_count !== 1 ? 'files' : 'file' }}
        </span>
      </div>
    </div>
    <hr class="my-4.5 border-gray-200" />
    <div
      v-if="currentFlow === 'vault'"
      class="rounded-xl py-5 text-center space-y-2 mb-4"
      style="background: #f7931e0d"
    >
      <div class="text-xs font-medium text-secondary-600">Your Vault-Share Code</div>
      <div class="text-xl font-semibold">****</div>
      <div>
        <MlbButton
          type="button"
          label="Change Code"
          class="rounded-2xl! bg-secondary-100! text-secondary-700! cursor-pointer!"
          @click="handleChangePin"
        />
      </div>
    </div>
    <GalleryComponent
      :media="gallery"
      :items-per-row="3"
      media-type="all"
      layout="grid"
      :item-size="108"
      :show-info="false"
      :is-loading="folderMediaLoading"
      :allow-batch-action="true"
      @batch-delete="handleBatchDelete"
    />
    <MlbModal
      v-model:show="showModal"
      class="rounded-3xl!"
      :bottom-sheet="modalComponent?.hasBottomSheet"
      :bottom-sheet-height="modalComponent?.height"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <BackButton
            label="Cancel"
            :previous-route="false"
            @update:go-back="handleBackButtonClick"
          />
          <h1 class="text-base font-semibold text-center">{{ modalComponent?.title }}</h1>
          <div></div>
        </div>
      </template>
      <component
        :is="modalComponent?.component"
        v-bind="modalComponent?.props"
        @update:folder="handleUpdateFolder"
        @submit="postSubmitActions()"
        @pin-submitted="handlePinSubmitted"
      />
    </MlbModal>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { NDropdown, NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useVaultStore } from '@/stores/vault.store'
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import { useArchive } from '@/composables/useArchive'
import { useStorageStore } from '@/stores/storage.store'
import type { FolderInterface } from '@/types/vault.types'
import BackButton from '@/components/common/BackButton.vue'
import type { AttachmentInterface } from '@/types/vault.types'
import { useFolderMenu } from '@/composables/folder.composables'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import GalleryComponent from '@/components/common/GalleryComponent.vue'
import CreateFolderForm from '@/components/vault/CreateFolderForm.vue'
import FamilyTraditionMediaForm from '@/components/home/FamilyTraditionMediaForm.vue'
import ShareFolderForm from '@/components/vault/ShareFolderForm.vue'
import VaultPinForm from '@/components/vault/VaultPinForm.vue'
import { useVault } from '@/composables/useVault'

const $route = useRoute()
const $router = useRouter()
const vaultStore = useVaultStore()
const storageStore = useStorageStore()
const { options, handleSelect } = useFolderMenu()
const { loading: vaultLoading, fetchVaultFolder, handleChangePin } = useVault()
const {
  folderMediaLoading,
  fetchFolderMedia,
  fetchFolderDetails,
  fetchArchiveFolders,
  handleDeleteMedia,
  // setSelectedFolder,
} = useArchive()

const showModal = ref<boolean>(false)

const handleBackButtonClick = () => {
  showModal.value = false
  const query = { ...$route.query }
  delete query.action
  delete query.tab
  // setSelectedFolder(null)
  $router.push({
    name: $route.name,
    params: { ...$route.params },
    query,
  })
}

const currentFlow = computed(() => $route.params.module)

const selectedFolder = computed<FolderInterface | StorageFolderInterface | null>(
  () => vaultStore.selectedFolder || storageStore.selectedFolder,
)

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
      members: (selectedFolder.value as FolderInterface)?.viewers || [],
      name: (selectedFolder.value as FolderInterface)?.title,
      files_count: (selectedFolder.value as FolderInterface)?.attachments.length,
      visibility: (selectedFolder.value as FolderInterface)?.is_public ? 'public' : 'private',
      firstname_field: '',
      lastname_field: '',
      src_field: '',
    }
  } else {
    return {
      members: [(selectedFolder.value as StorageFolderInterface)?.creator],
      name: (selectedFolder.value as StorageFolderInterface)?.name,
      files_count: (selectedFolder.value as StorageFolderInterface)?.total_files,
      visibility: (selectedFolder.value as StorageFolderInterface)?.is_shared
        ? 'public'
        : 'private',
      firstname_field: 'name',
      lastname_field: '',
      src_field: '',
    }
  }
})

const gallery = computed<AttachmentInterface[]>(() =>
  currentFlow.value === 'vault'
    ? (vaultStore.selectedFolder?.attachments ?? [])
    : (storageStore.folderMedia ?? []),
)

const initSelect = (key: string, folder: FolderInterface | StorageFolderInterface) => {
  if (key !== 'delete') {
    showModal.value = true
  }
  handleSelect(key, folder)
}

const handleUpdateFolder = async (value: {
  key: 'edit' | 'create'
  folder: FolderInterface | StorageFolderInterface
}) => {
  if (['edit', 'create'].includes(value.key)) {
    showModal.value = false
    if (value.key === 'edit') {
      await fetchFolderDetails()
    } else {
      await fetchArchiveFolders()
    }
  }
}

const postSubmitActions = async () => {
  if ($route.query.tab || $route.query.action) {
    await fetchFolderDetails()
    showModal.value = false
    const query = { ...$route.query }
    delete query.tab
    $router.push({
      name: $route.name,
      params: $route.params,
      query,
    })
  }
}

const handlePinSubmitted = async (value: string) => {
  await fetchVaultFolder(vaultStore.selectedFolder?.id as number, value)
  showModal.value = false
  const query = { ...$route.query }
  delete query.action
  $router.push({
    name: $route.name,
    params: { ...$route.params, id: vaultStore.selectedFolder?.id as number },
    query,
  })
}

const modalComponent = computed(() => {
  switch (true) {
    case !!$route.params.id && !$route.query.action && !$route.query.tab:
      const archiveExist =
        currentFlow.value === 'vault' ? vaultStore.selectedFolder : storageStore.selectedFolder
      return {
        component: CreateFolderForm,
        title: `${archiveExist ? 'Edit' : 'Create'} ${currentFlow.value === 'vault' ? 'Vault' : 'Storage'} Folder`,
        hasBottomSheet: true,
      }
    case !!$route.params.id && ['file', 'audio'].includes($route.query.tab as string):
      return {
        component: FamilyTraditionMediaForm,
        props: {
          onlyMediaUpload: currentFlow.value === 'vault' ? true : false,
        },
        title: 'Upload File',
        height: 576,
        hasBottomSheet: true,
      }
    case !!$route.params.id && $route.query.action === 'share':
      return {
        component: ShareFolderForm,
        props: {
          folder: storageStore.selectedFolder,
        },
        hasBottomSheet: false,
      }
    case !$route.params.id && $route.query.action === 'verify-pin':
      return {
        component: VaultPinForm,
        props: {
          loading: vaultLoading.value,
        },
        title: 'Enter Vault PIN',
      }
    default:
      return null
  }
})

const handleGalleryBack = () => {
  $router.push({
    name: 'App.HeritageVaultView',
    params: { module: $route.params.module, page: 'folders' },
  })
}

const handleBatchDelete = async (mediaIds: number[]) => {
  await handleDeleteMedia(mediaIds)
}

onMounted(async () => {
  await fetchFolderMedia()
  // if (!selectedFolder.value) {
  await fetchFolderDetails()
  // }
})

watch(
  [() => $route.query.tab, () => $route.query.action],
  ([tab, action]) => {
    if (tab || action) {
      showModal.value = true
    }
  },
  { immediate: true },
)

watch(
  () => selectedFolder.value,
  (newVal) => {
    if (!newVal) {
      $router.push({
        name: 'App.HeritageVaultView',
        params: { module: $route.params.module, page: 'folders' },
      })
    }
  },
  { immediate: true },
)
</script>
