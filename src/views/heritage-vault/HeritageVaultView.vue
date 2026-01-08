<template>
  <section>
    <!-- Render child routes (e.g., Gallery view) -->
    <router-view v-if="$route.name === 'App.HeritageVaultView.Gallery'" />

    <!-- Render tab content when on the Folders route -->
    <div v-else>
      <div
        v-if="!($route.params.module === 'vault' && $route.params.page === 'folders')"
        class="flex items-center justify-between mt-3 mb-6"
      >
        <div></div>
        <!-- <div>Heritage Vault</div> -->
        <div class="mr-3">
          <MlbButton
            v-if="$route.params.module === 'storage'"
            text
            class="font-bold!"
            label="Add"
            @click="handleAddModal"
          />
          <!-- <MlbIcon
            v-if="$route.params.module === 'storage'"
            name="vuesax.linear.add"
            color="#333333"
            :size="24"
            @click.prevent="handleAddModal"
          /> -->
        </div>
      </div>
      <n-tabs
        v-if="!($route.params.module === 'vault' && $route.params.page === 'folders')"
        v-model:value="activeTab"
        animated
        :bar-width="0"
        class="archive-tabs"
        add-tab-style="color: #333333 !important"
        justify-content="space-evenly""
        @update:value="onTabUpdate"
      >
        <n-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :name="tab.name"
          :tab="tab.label"
          class="w-full mt-6 font-semibold!"
        >
        </n-tab-pane>
      </n-tabs>
      <component
        :is="tabs.find((tab) => tab.name === activeTab)?.component"
        v-bind="tabs.find((tab) => tab.name === activeTab)?.props"
        @update:show-add-modal="handleAddModal"
      />
    </div>
    <MlbModal v-model:show="showModal" class="rounded-3xl! bottom-sheet" :bottom-sheet="true">
      <template #header>
        <div class="flex items-center justify-between">
          <BackButton
            label="Cancel"
            :previous-route="false"
            @update:go-back="handleBackButtonClick"
          />
          <h1 class="text-base font-semibold text-center">
            New
            {{
              String($route.params.module).charAt(0).toUpperCase() +
              String($route.params.module).slice(1)
            }}
            Folder
          </h1>
          <div></div>
        </div>
      </template>
      <CreateFolderForm @update:folder="handleFolderModify" />
    </MlbModal>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, h } from 'vue'
import { NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
// import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import type { TabInterface } from '@/types/general.types'
import type { FolderInterface } from '@/types/vault.types'
import { AlertService } from '@/services/alert.service'
import { useGeneralStore } from '@/stores/general.store'
import type { StorageFolderInterface } from '@/types/storage.types'
import CreateFolderForm from '@/components/vault/CreateFolderForm.vue'
import FamilyArchive from '@/views/heritage-vault/partials/FamilyArchive.vue'

const $route = useRoute()
const $router = useRouter()
const generalStore = useGeneralStore()

const showModal = ref<boolean>(false)
const activeTab = ref<'storage' | 'vault'>('storage')

const tabs = computed<TabInterface[]>(() => [
  {
    name: 'storage',
    label: 'Storage',
    component: FamilyArchive,
    props: {
      fileCount: 0,
      storageFolders: [],
    },
  },
  {
    name: 'vault',
    label: 'Vault',
    component: FamilyArchive,
  },
])

const onTabUpdate = (value: string) => {
  $router.push({
    name: $route.name ?? undefined,
    params: {
      module: value,
    },
  })
}

const handleAddModal = () => {
  showModal.value = true
}

const handleBackButtonClick = () => {
  showModal.value = false
}

const handleFolderModify = (payload: {
  key: string
  folder?: FolderInterface | StorageFolderInterface | null
}) => {
  showModal.value = false
  const folderName =
    payload.folder && $route.params.module === 'vault'
      ? (payload.folder as FolderInterface).title
      : (payload.folder as StorageFolderInterface).name
  AlertService.success({
    subject: `New ${String($route.params.module).charAt(0).toUpperCase() + String($route.params.module).slice(1)} Folder <span class="font-bold text-gray-400">"${folderName}"</span> Created`,
    message: 'Folder created successfully',
    imageUrl: 'images/success.png',
    imageAlt: 'Success',
    imageClass: 'w-24 h-24 object-contain',
    bottomSheet: true,
    bottomSheetHeight: 400,
    confirmButtonText: 'Add Media',
    customClass: {
      confirmButton: 'rounded-2xl! bg-primary-700! h-13! text-white! w-!',
    },
    bottomSheetFooterClass: 'justify-center! mt-3!',
    buttonConfig: {
      confirm: {
        text: 'Add Media',
        action: async () => {
          AlertService.close()
          setTimeout(() => {
            $router.push({
              name: 'App.HeritageVaultView.Gallery',
              params: { id: payload.folder?.id },
              query: { tab: 'file' },
            })
          }, 100)
        },
        closeOnClick: true,
      },
    },
    header: h('div', { class: 'flex items-center justify-between' }, [
      h(
        'a',
        {
          class: 'text-base text-center text-gray-700 cursor-pointer',
          onClick: () => {
            AlertService.close()
          },
        },
        'Cancel',
      ),
      h('div'),
      h(
        'a',
        {
          class: 'text-base text-center underline text-primary-700 cursor-pointer',
          onClick: async () => {
            AlertService.close()
            setTimeout(() => {
              $router.push({
                name: 'App.HeritageVaultView.Gallery',
                params: { id: payload.folder?.id },
                query: { tab: 'file' },
              })
            }, 100)
          },
        },
        'View Folder',
      ),
    ]),
  })
}

watch(
  () => $route.params.module,
  (value) => {
    activeTab.value = (value as 'storage' | 'vault') ?? 'storage'
  },
  { immediate: true },
)

onMounted(() => {
  // if (!$route.params.module) {
  //   $router.push({
  //     name: 'App.HeritageVaultView',
  //     params: {
  //       ...$route.params,
  //       module: 'storage',
  //       page: 'folders',
  //     },
  //   })
  // }
  generalStore.setStoreProp('flow', $route.params.module || 'storage')
})
</script>
<style scoped>
:deep(.archive-tabs .n-tabs-tab__label) {
  font-weight: semibold;
}
</style>