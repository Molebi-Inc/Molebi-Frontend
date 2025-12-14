<template>
  <section>
    <div
      v-if="$route.params.submodule !== 'vault'"
      class="flex items-center justify-between mt-3 mb-6"
    >
      <div></div>
      <div>Heritage Vault</div>
      <div>
        <MlbIcon
          name="vuesax.linear.add"
          color="#333333"
          :size="24"
          @click.prevent="handleAddModal"
        />
      </div>
    </div>

    <!-- Render child routes (e.g., Gallery view) -->
    <router-view v-if="$route.name !== 'App.HeritageVaultView.Folders'" />

    <!-- Render tab content when on the Folders route -->
    <div v-else>
      <template v-if="$route.params.submodule === 'vault'">
        <component
          :is="tabs.find((tab) => tab.name === activeTab)?.component"
          v-bind="tabs.find((tab) => tab.name === activeTab)?.props"
        />
      </template>
      <n-tabs
        v-else
        v-model:value="activeTab"
        animated
        :bar-width="0"
        add-tab-style="color: #333333 !important"
        justify-content="space-evenly"
        @update:value="onTabUpdate"
      >
        <n-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :name="tab.name"
          :tab="tab.label"
          class="w-full mt-6"
        >
          <component :is="tab.component" v-bind="tab.props" />
        </n-tab-pane>
      </n-tabs>
    </div>
    <MlbModal v-model:show="showModal" class="rounded-3xl!">
      <template #header>
        <div>
          <BackButton
            icon="vuesax.linear.arrow-left"
            :previous-route="false"
            @update:go-back="handleBackButtonClick"
          />
          <h1 class="text-2xl font-bold text-center mt-6">New Storage Folder</h1>
        </div>
      </template>
    </MlbModal>
  </section>
</template>
<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  // computed,
  watch,
} from 'vue'
import { NTabPane, NTabs } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import FamilyArchive from './partials/FamilyArchive.vue'
import type { TabInterface } from '@/types/general.types'
import TimeCapsule from '../time-capsules/TimeCapsule.vue'
// import { useVault } from '@/composables/useVault'

const $route = useRoute()
const $router = useRouter()

const showModal = ref<boolean>(false)
const activeTab = ref<'family-archive' | 'time-capsule'>('family-archive')

const tabs = computed<TabInterface[]>(() => [
  {
    name: 'family-archive',
    label: 'Family Archive',
    component: FamilyArchive,
    props: {
      fileCount: 0,
      storageFolders: [],
    },
  },
  {
    name: 'time-capsule',
    label: 'Time Capsule',
    component: TimeCapsule,
  },
])

// const component = computed(() => {
//   return {
//     'family-archive': FamilyArchive,
//     'time-capsule': TimeCapsule,
//   }[$route.params.module as string]
// })

const onTabUpdate = (value: string) => {
  $router.push({
    name: $route.name ?? undefined,
    params: {
      ...$route.params,
      module: value,
    },
  })
}

const handleAddModal = () => {}
const handleBackButtonClick = () => {}

watch(
  () => $route.params.module,
  (value) => {
    activeTab.value = (value as 'family-archive' | 'time-capsule') ?? 'family-archive'
  },
  { immediate: true },
)

onMounted(() => {
  if (!$route.params.module) {
    $router.push({
      name: $route.name ?? undefined,
      params: {
        ...$route.params,
        module: 'family-archive',
      },
    })
  }
})
</script>
