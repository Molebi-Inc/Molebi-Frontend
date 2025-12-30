<template>
  <div class="relative h-full">
    <div class="flex justify-between items-center mb-6">
      <div>
        <BackButton
          v-if="
            $route.name === 'App.VaultFolderView' ||
            ($route.name === 'App.StorageFolderView' && $route.params.id)
          "
          icon="vuesax.linear.arrow-left"
          :previous-route="false"
          @update:go-back="handleVaultBackButtonClick"
        />
      </div>
      <div>
        <div v-if="!!$route.params.id" class="text-2xl font-bold text-center">
          {{
            (archiveFolder as StorageFolderInterface)?.name ||
            (archiveFolder as FolderInterface)?.title
          }}
        </div>
      </div>
      <div>
        <div v-if="routeNames.includes(String($route.name))">
          <MlbButton
            type="button"
            class="mb-4 rounded-2xl bg-green-700 py-4 px-7 text-white w-100 cursor-pointer!"
            @click="handleModalAction"
          >
            <template #icon>
              <MlbIcon name="vuesax.linear.add" :size="40" color="#ffffff" />
            </template>
            {{ !!$route.params.id ? 'Add media' : `Add ${capitalize(currentFlow)} Folder` }}
          </MlbButton>
        </div>
      </div>
    </div>
    <div
      v-if="emptyState"
      class="min-h-screen flex flex-col items-center justify-center text-center gap-4"
    >
      <img
        :src="emptyState.image"
        alt="Vault Folder"
        :class="
          !$route.params.id ? 'w-[240px] h-[188px] object-cover' : 'w-[90px] h-[90px] object-cover'
        "
      />
      <p v-html="emptyState.message"></p>
      <MlbButton
        type="button"
        class="mb-4 rounded-2xl bg-green-700 py-4 px-7 text-white w-100 cursor-pointer!"
        @click="handleModalAction"
      >
        <template #icon>
          <MlbIcon name="vuesax.linear.add" :size="40" color="#ffffff" />
        </template>
        {{ !!$route.params.id ? 'Add media' : `Add ${capitalize(currentFlow)} Folder` }}
      </MlbButton>
    </div>
    <div class="mt-4">
      <component
        :is="viewComponent?.component"
        v-bind="viewComponent?.props"
        @update:vaultClick="$router.push({ name: 'App.VaultFolderView' })"
        @select:option="handleSelectOption"
        @click:folder="handleClickFolder"
        @batch-delete="handleDeleteMedia"
      />
    </div>

    <!-- <div v-if="routeNames.includes(String($route.name))" class="absolute bottom-10 right-10">
      <n-button
        class="rounded-full! bg-primary-500! text-white! w-20! h-20! shadow-[0px_6.33px_31.67px_0px_#16C4504D]!"
        @click="handleModalAction"
      >
        <template #icon>
          <MlbIcon name="vuesax.linear.add" :size="40" color="#ffffff" />
        </template>
      </n-button>
    </div> -->

    <MlbModal v-model:show="showVaultModal" class="rounded-3xl!">
      <template #header>
        <div>
          <BackButton
            icon="vuesax.linear.arrow-left"
            :previous-route="false"
            @update:go-back="handleBackButtonClick"
          />
          <h1 class="text-2xl font-bold text-center mt-6">{{ modalComponent?.title }}</h1>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NButton, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useVault } from '@/composables/useVault'
import MlbModal from '@/components/ui/MlbModal.vue'
import { useVaultStore } from '@/stores/vault.store'
import { useArchive } from '@/composables/useArchive'
import { useStorageStore } from '@/stores/storage.store'
import { handleApiError } from '@/helpers/error.helpers'
import BackButton from '@/components/common/BackButton.vue'
import VaultPinForm from '@/components/vault/VaultPinForm.vue'
import FolderWrapper from '@/components/vault/FolderWrapper.vue'
import VaultContainer from '@/components/vault/VaultContainer.vue'
import type { StorageFolderInterface } from '@/types/storage.types'
import ShareFolderForm from '@/components/vault/ShareFolderForm.vue'
import GalleryComponent from '@/components/common/GalleryComponent.vue'
import CreateFolderForm from '@/components/vault/CreateFolderForm.vue'
import { useDeleteFolderMediaMutation } from '@/services/storage.services'
import type { FolderInterface, AttachmentInterface } from '@/types/vault.types'
import FamilyTraditionMediaForm from '@/components/home/FamilyTraditionMediaForm.vue'
import { capitalize } from '@/helpers/general.helpers'
import emptyVaultImage from '@/assets/images/empty-vault.png'
import emptyGalleryImage from '@/assets/images/empty-gallery.png'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const vaultStore = useVaultStore()
const storageStore = useStorageStore()
const deleteFolderMediaMutation = useDeleteFolderMediaMutation()
const {
  currentFlow,
  foldersLoading,
  folderMediaLoading,
  fetchArchiveFolders,
  fetchFolderMedia,
  fetchFolderDetails,
  setSelectedFolder,
  clearFolderMedia,
} = useArchive()
const { loading: vaultLoading, fetchVaultFolder } = useVault()

const folders = computed<FolderInterface[] | StorageFolderInterface[]>(() =>
  currentFlow.value === 'vault' ? vaultStore.folders : storageStore.folders,
)

const gallery = computed<AttachmentInterface[]>(() =>
  currentFlow.value === 'vault'
    ? (vaultStore.selectedFolder?.attachments ?? [])
    : (storageStore.folderMedia ?? []),
)

const showVaultModal = ref<boolean>(false)
const routeNames = ['App.VaultFolderView', 'App.StorageFolderView']

const emptyState = computed(() => {
  switch (true) {
    case !folders.value.length &&
      routeNames.includes(String($route.name)) &&
      !$route.params.id &&
      !foldersLoading.value:
      // !storageStore.foldersLoading &&
      // !vaultStore.foldersLoading:
      return {
        message: 'Nothing to see here yet',
        image: emptyVaultImage,
      }
    case !gallery.value.length &&
      routeNames.includes(String($route.name)) &&
      !!$route.params.id &&
      !folderMediaLoading.value:
      return {
        message: 'No media files uploaded yet!',
        image: emptyGalleryImage,
      }
    default:
      return null
  }
})

const viewComponent = computed(() => {
  switch (true) {
    case $route.name === 'App.VaultView':
      return {
        component: VaultContainer,
        props: {
          fileCount: folders.value.reduce(
            (acc, folder) => acc + (folder as FolderInterface).attachments.length,
            0,
          ),
        },
      }
    // case (folders.value.length || storageStore.foldersLoading || vaultStore.foldersLoading) &&
    case (folders.value.length || foldersLoading.value) &&
      routeNames.includes(String($route.name)) &&
      !$route.params.id:
      return {
        component: FolderWrapper,
        props: {
          folders: folders.value,
        },
      }
    case (gallery.value.length || folderMediaLoading.value) &&
      routeNames.includes(String($route.name)) &&
      !!$route.params.id:
      return {
        component: GalleryComponent,
        props: {
          media: gallery.value,
          itemsPerRow: 6,
          mediaType: 'all',
          layout: 'grid',
          itemSize: 165,
          showInfo: false,
          isLoading: folderMediaLoading.value,
          allowBatchAction: true,
        },
      }
    default:
      return null
  }
})

const archiveFolder = computed(() => {
  return currentFlow.value === 'vault' ? vaultStore.selectedFolder : storageStore.selectedFolder
})
const modalComponent = computed(() => {
  switch (true) {
    case routeNames.includes(String($route.name)) && !$route.params.id && !$route.query.action:
      const archiveExist = archiveFolder.value
      return {
        component: CreateFolderForm,
        title: `${archiveExist ? 'Edit' : 'Create'} ${currentFlow.value === 'vault' ? 'Vault' : 'Storage'} Folder`,
      }
    case routeNames.includes(String($route.name)) &&
      !!$route.params.id &&
      ['file', 'audio'].includes($route.query.tab as string):
      return {
        component: FamilyTraditionMediaForm,
        title: 'Upload File',
        props: {
          onlyMediaUpload: currentFlow.value === 'vault' ? true : false,
        },
      }
    case routeNames.includes(String($route.name)) &&
      !$route.params.id &&
      $route.query.action === 'share':
      return {
        component: ShareFolderForm,
        props: {
          folder: storageStore.selectedFolder,
        },
      }
    case routeNames.includes(String($route.name)) &&
      !$route.params.id &&
      $route.query.action === 'verify-pin':
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

const postSubmitActions = () => {
  if ($route.query.tab) {
    fetchFolderDetails()
    showVaultModal.value = false
    const query = { ...$route.query }
    delete query.tab
    $router.push({
      name: $route.name,
      params: $route.params,
      query,
    })
  }
}

const handleClickFolder = (event: { flow: string }) => {
  if (event.flow === 'vault' && $route.query.action === 'verify-pin') {
    showVaultModal.value = true
  }
}

const handleVaultBackButtonClick = () => {
  if ($route.params.id) {
    clearFolderMedia()
    setSelectedFolder(null)
    $router.push({
      name: currentFlow.value === 'vault' ? 'App.VaultFolderView' : 'App.StorageFolderView',
    })
    return
  }
  $router.back()
}

const handleSelectOption = (value: {
  key: string
  folder: FolderInterface | StorageFolderInterface
}) => {
  if (value.key === 'edit') {
    showVaultModal.value = true
  }
}

const handleUpdateFolder = (key: string) => {
  if (['edit', 'create'].includes(key)) {
    showVaultModal.value = false
  }
}

const handlePinSubmitted = async (value: string) => {
  vaultStore.setStoreProp('pin', value)
  await fetchVaultFolder(vaultStore.selectedFolder?.id as number, value)
  showVaultModal.value = false
  const query = { ...$route.query }
  delete query.action
  $router.push({
    name: $route.name,
    params: { ...$route.params, id: vaultStore.selectedFolder?.id as number },
    query,
  })
}

const handleModalAction = () => {
  showVaultModal.value = true

  let query = { ...$route.query }
  if (routeNames.includes(String($route.name)) && !!$route.params.id) {
    query = { ...query, tab: 'file' }
  }

  $router.push({
    name: $route.name,
    params: $route.params,
    query: query,
  })
}

const handleBackButtonClick = () => {
  showVaultModal.value = false
  if ($route.query.action) {
    const query = { ...$route.query }
    delete query.action
    $router.push({
      name: $route.name,
      params: $route.params,
      query,
    })
  }
  if ($route.query.tab) {
    const query = { ...$route.query }
    delete query.tab
    $router.push({
      name: $route.name,
      params: $route.params,
      query,
    })
  }
}

const handleDeleteMedia = async (mediaIds: number[]) => {
  try {
    const results = await Promise.allSettled(
      mediaIds.map((id) => deleteFolderMediaMutation.mutateAsync(id)),
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    if (successful > 0) {
      message.success(`${successful} ${successful === 1 ? 'item' : 'items'} deleted successfully`)
    }

    if (failed > 0) {
      message.error(`Failed to delete ${failed} ${failed === 1 ? 'item' : 'items'}`)
    }

    await fetchFolderMedia()
  } catch (error) {
    handleApiError(error, message)
  }
}

watch(
  () => $route.query.action,
  (newVal) => {
    if (
      (newVal &&
        newVal === 'share' &&
        !!storageStore.selectedFolder &&
        currentFlow.value === 'storage') ||
      (newVal === 'verify-pin' && !!vaultStore.selectedFolder && currentFlow.value === 'vault')
    ) {
      showVaultModal.value = true
    } else {
      const query = { ...$route.query }
      delete query.action
      $router.push({
        name: $route.name,
        params: $route.params,
        query,
      })
    }
  },
  { immediate: true },
)

watch(
  () => $route.params.id,
  async (newVal) => {
    if (newVal) {
      await fetchFolderDetails()
      await fetchFolderMedia()
    }
  },
  { immediate: true },
)

watch(
  [() => routeNames.includes(String($route.name)), () => $route.params.id],
  async ([routeName, id]) => {
    if (routeName && !id) {
      await fetchArchiveFolders()
    }
  },
  { immediate: true },
)

watch(
  [() => String($route.name), () => $route.params.id],
  async ([routeName, id]) => {
    if (routeName === 'App.VaultFolderView' && !!id && !vaultStore.selectedFolder) {
      $router.push({ name: 'App.VaultFolderView' })
    }
  },
  { immediate: true },
)

watch(
  () => $route.query.tab,
  (newVal) => {
    if (newVal && $route.params.id) {
      console.log('newVal', newVal)
      showVaultModal.value = true
    }
  },
  { immediate: true },
)
</script>

<style scoped></style>
