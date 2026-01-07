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
        <div v-if="showFolders" class="h-full">
          <div
            v-if="module === 'vault' && $route.params.page === 'folders'"
            class="my-6 flex items-center justify-between"
          >
            <BackButton
              label=""
              icon="vuesax.linear.arrow-left"
              :previous-route="false"
              @update:go-back="
                $router.push({
                  name: 'App.HeritageVaultView',
                  params: { module: 'vault' },
                })
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
          <FolderWrapper
            :folders="folders"
            :heritageVault="true"
            @click:folder="handleFolderClick"
          />
        </div>
        <div
          v-else
          class="flex-1 flex flex-col justify-center p-4 rounded-lg hover:shadow-md hover:bg-gray-100 cursor-pointer"
          @click="
            $router.push({ name: $route.name, params: { ...$route.params, page: 'folders' } })
          "
        >
          <MlbIcon name="vuesax.bold.lock" :size="24" />
          <div class="mt-1 font-medium">Your Vault</div>
          <div class="mt-3 font-medium text-gray-700 text-sm">{{ formattedFileCount }}</div>
        </div>
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
import { computed, onMounted, ref, watch, h } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { handleApiError } from '@/helpers/error.helpers'
import { useStorageStore } from '@/stores/storage.store'
import BackButton from '@/components/common/BackButton.vue'
import FolderWrapper from '@/components/vault/FolderWrapper.vue'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { FolderInterface } from '@/types/vault.types'
import { useGeneralStore } from '@/stores/general.store'
import VaultPinForm from '@/components/vault/VaultPinForm.vue'
import { AlertService } from '@/services/alert.service'

const generalStore = useGeneralStore()
const vault = useVault()
const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const storage = useStorage()
const vaultStore = useVaultStore()
const storageStore = useStorageStore()

const $emit = defineEmits<{
  (e: 'update:show-add-modal', value: boolean): void
}>()

const module = ref<'storage' | 'vault'>('storage')

const isEmpty = computed(
  () =>
    (module.value === 'storage' && !storageStore.folders.length) ||
    (module.value === 'vault' && !vaultStore.folders.length && $route.params.page === 'folders'),
)

const showFolders = computed(
  () =>
    (module.value === 'storage' && storageStore.folders.length) ||
    (module.value === 'vault' && vaultStore.folders.length && $route.params.page === 'folders'),
)

const folders = computed<StorageFolderInterface[] | FolderInterface[]>(() =>
  module.value === 'storage' ? storageStore.folders : vaultStore.folders,
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

const handleAddModal = () => {
  vaultStore.setStoreProp('selectedFolder', null)
  $emit('update:show-add-modal', true)
}

const handleFolderClick = (event: { id?: number }) => {
  if ($route.params.module === 'vault') {
    AlertService.alert({
      subject: 'Enter Vault PIN',
      message: 'Enter the PIN to your vault',
      closable: true,
      showIcon: false,
      closablePosition: 'left',
      bottomSheet: true,
      bottomSheetHeight: 462,
      textAlign: 'center',
      html: h(VaultPinForm, {
        loading: vaultStore.folderLoading,
        onPinSubmitted: async (value: string) => {
          try {
            vaultStore.setStoreProp('pin', value)
            await vault.fetchVaultFolder(vaultStore.selectedFolder?.id as number, value)
            $router.push({
              name: 'App.HeritageVaultView.Gallery',
              params: {
                module: $route.params.module,
                page: $route.params.page,
                id: vaultStore.selectedFolder?.id,
              },
            })
            AlertService.close()
          } catch (error) {
            handleApiError(error, message)
          }
        },
      }),
      showCancelButton: false,
      showConfirmButton: false,
    })
    return
  }
  $router.push({
    name: 'App.HeritageVaultView.Gallery',
    params: {
      module: $route.params.module,
      page: $route.params.page,
      id: event.id,
    },
  })
}

onMounted(async () => {
  await getArchiveFiles()
})

watch(
  () => $route.params.module as 'storage' | 'vault',
  () => {
    if ($route.params.module) {
      module.value = ($route.params.module as 'storage' | 'vault') || 'storage'
    } else {
      $router.push({ name: $route.name, params: { ...$route.params, page: 'folders' } })
    }
    generalStore.setStoreProp('flow', module.value)
  },
  { immediate: true },
)
</script>
