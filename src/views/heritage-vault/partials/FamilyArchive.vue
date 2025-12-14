<template>
  <section>
    <div class="flex flex-col h-screen">
      <div class="flex-[3] overflow-auto">
        <div
          v-if="isEmpty"
          class="h-full flex flex-col items-center justify-center text-center gap-4"
        >
          <img
            src="@/assets/images/empty-vault.png"
            alt="Vault Folder"
            class="w-[200px] h-[160px] object-cover"
          />
          <p>Nothing to see here yet <br />Click the '+' button at the top to add one</p>
        </div>
        <div
          v-if="submodule === 'vault' && vaultStore.folders.length"
          class="my-6 flex items-center justify-between"
        >
          <BackButton
            icon="vuesax.linear.arrow-left"
            :previous-route="false"
            @update:go-back="
              $router.push({ name: 'App.HeritageVaultView', params: { module: 'family-archive' } })
            "
          />
          <div>Your Vault</div>
          <div>
            <MlbIcon
              name="vuesax.linear.add"
              color="#333333"
              :size="24"
              @click.prevent="handleAddModal"
            />
          </div>
        </div>
        <div v-if="showFolders" class="h-full">
          <FolderWrapper
            :folders="folders"
            :heritageVault="true"
            @click:folder="handleFolderClick"
          />
        </div>
      </div>

      <hr v-if="submodule === 'storage'" class="border-gray-200" />

      <div
        v-if="submodule === 'storage'"
        class="flex-[1] flex flex-col justify-center p-4 rounded-lg hover:shadow-md hover:bg-gray-100 cursor-pointer"
        @click="
          $router.push({ name: 'App.HeritageVaultView.Folders', params: { submodule: 'vault' } })
        "
      >
        <MlbIcon name="vuesax.bold.lock" :size="24" />
        <div class="mt-1 font-medium">Your Vault</div>
        <div class="mt-3 font-medium text-gray-700 text-sm">{{ formattedFileCount }}</div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useVault } from '@/composables/useVault'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useVaultStore } from '@/stores/vault.store'
import { computed, onMounted, ref, watch } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { handleApiError } from '@/helpers/error.helpers'
import { useStorageStore } from '@/stores/storage.store'
import BackButton from '@/components/common/BackButton.vue'
import FolderWrapper from '@/components/vault/FolderWrapper.vue'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { FolderInterface } from '@/types/vault.types'
import { useGeneralStore } from '@/stores/general.store'

const generalStore = useGeneralStore()
const vault = useVault()
const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const storage = useStorage()
const vaultStore = useVaultStore()
const storageStore = useStorageStore()

const submodule = ref<'storage' | 'vault'>('storage')

const isEmpty = computed(
  () =>
    (submodule.value === 'storage' && !storageStore.folders.length) ||
    (submodule.value === 'vault' && !vaultStore.folders.length),
)

const showFolders = computed(
  () =>
    (submodule.value === 'storage' && storageStore.folders.length) ||
    (submodule.value === 'vault' && vaultStore.folders.length),
)

const folders = computed<StorageFolderInterface[] | FolderInterface[]>(() =>
  submodule.value === 'storage' ? storageStore.folders : vaultStore.folders,
)

const formattedFileCount = computed(() => {
  if (vaultStore.folders.length === 0) return 'No Files'
  return `${vaultStore.folders.length.toLocaleString()} ${vaultStore.folders.length === 1 ? 'file' : 'files'}`
})

const getArchiveFiles = async () => {
  try {
    await storage.fetchStorageFolders()
    await vault.fetchVaultFolders()
  } catch (error) {
    handleApiError(error, message)
  }
}

const handleAddModal = () => {}

const handleFolderClick = (event: { id?: number }) => {
  $router.push({
    name: 'App.HeritageVaultView.Gallery',
    params: {
      module: $route.params.module,
      submodule: submodule.value,
      id: event.id,
    },
  })
}

onMounted(async () => {
  await getArchiveFiles()
})

watch(
  () => $route.params.submodule as 'storage' | 'vault',
  () => {
    if ($route.params.submodule) {
      submodule.value = ($route.params.submodule as 'storage' | 'vault') || 'storage'
    } else {
      $router.push({ name: 'App.HeritageVaultView.Folders', params: { submodule: 'storage' } })
    }
    generalStore.setStoreProp('flow', submodule.value)
  },
  { immediate: true },
)
</script>
