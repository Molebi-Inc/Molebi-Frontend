<template>
  <div class="relative h-full">
    <BackButton
      v-if="
        $route.name === 'App.VaultFolderView' ||
        ($route.name === 'App.StorageFolderView' && $route.params.id)
      "
      icon="vuesax.linear.arrow-left"
    />
    <div
      v-if="emptyState"
      class="min-h-screen flex flex-col items-center justify-center text-center gap-4"
    >
      <img
        :src="`/src/assets/${emptyState.image}`"
        alt="Vault Folder"
        :class="
          !$route.params.id ? 'w-[240px] h-[188px] object-cover' : 'w-[90px] h-[90px] object-cover'
        "
      />
      <p v-html="emptyState.message"></p>
    </div>
    <div class="mt-4">
      <component
        :is="viewComponent?.component"
        v-bind="viewComponent?.props"
        @update:vaultClick="$router.push({ name: 'App.VaultFolderView' })"
        @select:option="handleSelectOption"
      />
    </div>

    <div v-if="routeNames.includes(String($route.name))" class="absolute bottom-10 right-10">
      <n-button
        class="rounded-full! bg-primary-500! text-white! w-20! h-20! shadow-[0px_6.33px_31.67px_0px_#16C4504D]!"
        @click="handleModalAction"
      >
        <template #icon>
          <MlbIcon name="vuesax.linear.add" :size="40" color="#ffffff" />
        </template>
      </n-button>
    </div>

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
      <component :is="modalComponent?.component" @update:folder="handleUpdateFolder" />
    </MlbModal>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import { useVaultStore } from '@/stores/vault.store'
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useArchive } from '@/composables/useArchive'
import { useStorageStore } from '@/stores/storage.store'
import BackButton from '@/components/common/BackButton.vue'
// import VaultPinForm from '@/components/vault/VaultPinForm.vue'
import FolderWrapper from '@/components/vault/FolderWrapper.vue'
import VaultContainer from '@/components/vault/VaultContainer.vue'
import type { StorageFolderInterface } from '@/types/storage.types'
import ShareFolderForm from '@/components/vault/ShareFolderForm.vue'
import GalleryComponent from '@/components/common/GalleryComponent.vue'
import CreateFolderForm from '@/components/vault/CreateFolderForm.vue'
import type { FolderInterface, AttachmentInterface } from '@/types/vault.types'
import FamilyTraditionMediaForm from '@/components/home/FamilyTraditionMediaForm.vue'

const $route = useRoute()
const $router = useRouter()
const vaultStore = useVaultStore()
const storageStore = useStorageStore()
const {
  currentFlow,
  folderMediaLoading,
  fetchArchiveFolders,
  fetchFolderMedia,
  fetchFolderDetails,
} = useArchive()

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
      !storageStore.foldersLoading &&
      !vaultStore.foldersLoading:
      return {
        message: 'Nothing to see here yet',
        image: 'images/empty-vault.png',
      }
    case !gallery.value.length && routeNames.includes(String($route.name)) && !!$route.params.id:
      return {
        message: 'No media files uploaded yet! <br /> Use the “+” button to upload media files',
        image: 'images/empty-gallery.png',
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
    case (folders.value.length || storageStore.foldersLoading || vaultStore.foldersLoading) &&
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
        },
      }
    default:
      return null
  }
})

const modalComponent = computed(() => {
  switch (true) {
    case routeNames.includes(String($route.name)) && !$route.params.id && !$route.query.action:
      const archiveExist =
        currentFlow.value === 'vault' ? vaultStore.selectedFolder : storageStore.selectedFolder
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
      }
    case routeNames.includes(String($route.name)) &&
      !$route.params.id &&
      $route.query.action === 'share':
      return {
        component: ShareFolderForm,
        title: 'Share Folder',
      }
    default:
      return null
    // {
    //   component: VaultPinForm,
    //   title: 'Enter Vault PIN',
    // }
  }
})

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
}

watch(
  () => $route.query.action,
  (newVal) => {
    if (newVal && newVal === 'share') {
      showVaultModal.value = true
    }
  },
  { immediate: true },
)
onMounted(async () => {
  if (routeNames.includes(String($route.name)) && !$route.params.id) {
    await fetchArchiveFolders()
  }
})

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
</script>

<style scoped></style>
