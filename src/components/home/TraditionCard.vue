<template>
  <div
    :class="{
      'flex justify-center items-center h-full': loading,
    }"
  >
    <div v-if="!items.length && !loading">
      <div class="py-9 px-4 bg-white rounded-2xl" style="box-shadow: 0px 4px 50px 0px #a8a8a81a">
        <p class="text-gray-400 text-sm font-medium text-center">
          You don't have a family tradition yet? <br />Let's start one!<br /><br />
          Click the family tradition button <br />
          to start
        </p>
      </div>
    </div>
    <div v-else-if="loading" class="flex justify-center items-center">
      <n-spin :show="!!loading" class="mb-8">
        <template #description>
          <span class="text-sm text-gray-500"> Getting family traditions... </span>
        </template>
      </n-spin>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="tradition in items"
        :key="tradition.id"
        class="p-4 bg-white rounded-2xl border border-gray-200 cursor-pointer"
        @click="handleClick(tradition)"
      >
        <div class="flex items-center justify-between mb-0.5">
          <h3 class="text-lg font-semibold text-gray-900 mb-0.5">{{ tradition.title }}</h3>
          <div>
            <n-dropdown
              :show="showDropdown(tradition.id)"
              :options="options"
              @select="(key) => handleSelect(key, tradition)"
              class="z-10!"
            >
              <n-button
                text
                type="tertiary"
                @click.stop.prevent="(e: MouseEvent) => handleShowDropdown(tradition.id, e)"
              >
                <MlbIcon
                  name="vuesax.linear.more"
                  :size="20"
                  color="#737373"
                  style="transform: rotate(90deg)"
                />
              </n-button>
            </n-dropdown>
          </div>
        </div>
        <p class="text-xs text-gray-700 mb-3 line-clamp-2" :title="tradition.description">
          {{ tradition.description }}
        </p>
        <hr class="mt-4 mb-3 border-gray-300" />
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-700 flex items-center gap-0.5">
            Every {{ tradition.created_at }}
          </div>
          <MlbAvatar
            :options="{ firstname_field: 'name', src_field: 'avatar', users: tradition.members }"
            :max="5"
            :size="24"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { NSpin, NDropdown, NButton } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import type { FamilyTradition } from '@/types/family-tradition.types'
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
import { useHome } from '@/composables/useHome'
import { AlertService } from '@/services/alert.service'
import { useRoute, useRouter } from 'vue-router'
import { useFamilyTraditionStore } from '@/stores/family-tradition.store'
import TraditionDetailsFooter from './TraditionDetailsFooter.vue'

withDefaults(
  defineProps<{
    items: FamilyTradition[]
    loading: boolean
  }>(),
  {
    items: () => [],
    loading: false,
  },
)
const $route = useRoute()
const $router = useRouter()
const familyTraditionStore = useFamilyTraditionStore()
const { deleteFamilyTradition } = useHome()

const selectedId = ref<string | number>(0)

const showDropdown = (id: string | number) => {
  return selectedId.value === id
}

const options = [
  {
    label: 'Edit',
    key: 'edit',
    icon: () => h(MlbIcon, { name: 'vuesax.linear.edit-2', size: 12, color: '#737373' }),
  },
  {
    label: 'Add Media',
    key: 'media',
    icon: () => h(MlbIcon, { name: 'vuesax.broke.add-square', size: 12, color: '#737373' }),
  },
  {
    label: 'Delete',
    key: 'delete',
    icon: () => h(MlbIcon, { name: 'placeholder', size: 12, color: '#C20000' }),
  },
]

const handleSelect = (key: string, tradition: FamilyTradition) => {
  const action = {
    edit: () => {
      familyTraditionStore.setStoreProp('selectedFamilyTradition', tradition)
      $router.push({ name: $route.name, query: { ftype: 'family_tradition', fid: tradition.id } })
    },
    media: () => {
      familyTraditionStore.setStoreProp('selectedFamilyTradition', tradition)
      $router.push({
        name: $route.name,
        query: { ftype: 'family_tradition_media', fid: tradition.id },
      })
    },
    delete: () => deleteFamilyTradition(tradition.id),
  }
  action[key as keyof typeof action]()
}

const handleShowDropdown = (id: string | number, e?: MouseEvent) => {
  e?.stopPropagation()

  selectedId.value === id ? (selectedId.value = 0) : (selectedId.value = id)
}

const handleClick = (tradition: FamilyTradition) => {
  AlertService.info({
    subject: tradition.title,
    message: tradition.description,
    closable: true,
    showIcon: false,
    closablePosition: 'left',
    html: h(TraditionDetailsFooter, {
      tradition,
      onNewMemory: () => handleAddNewMemory(),
    }),
    showCancelButton: false,
  })
}

const handleAddNewMemory = () => {
  console.log('add new memory')
  AlertService.close()
}
</script>
