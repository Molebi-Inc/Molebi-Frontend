<script setup lang="ts">
import { computed } from 'vue'
import { NSpin } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import FamilyUpdateItem from './FamilyUpdateItem.vue'
import type { Announcement } from '@/types/announcement.types'
import { useMediaQuery } from '@vueuse/core'

const props = defineProps<{
  show: boolean
  items: Announcement[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'create'): void
  (e: 'edit-item', item: Announcement): void
  (e: 'delete-item', id: number): void
}>()

const hasItems = computed(() => props.items.length > 0)
const isMobile = useMediaQuery('(max-width: 768px)')
</script>

<template>
  <MlbModal :show="show" :max-width="720" :bottom-sheet="isMobile" :bottom-sheet-height="680" class="rounded-3xl!"
    @update:show="emit('update:show', $event)">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-neutral-900">Family Updates</h3>
        <BackButton label="Close" :previous-route="false" @update:go-back="emit('update:show', false)" />
      </div>
    </template>

    <div class="mb-4">
      <button
        class="px-3 text-base rounded-xl bg-primary text-white font-semibold hover:bg-primary-800 transition-colors cursor-pointer w-full py-4"
        @click="emit('create')">
        + Add a New Family Update
      </button>
    </div>
    <div class="max-h-[65vh] overflow-y-auto pr-1">
      <div v-if="loading" class="flex justify-center py-10">
        <NSpin :show="true" />
      </div>

      <div v-else-if="!hasItems" class="text-center py-8">
        <p class="text-sm text-neutral-400 mb-5">No family updates yet.</p>
        <button
          class="bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-6 py-3 rounded-3xl transition-colors"
          @click="emit('create')">
          Add your first update
        </button>
      </div>

      <div v-else class="space-y-3">
        <FamilyUpdateItem v-for="item in items" :key="item.id" :item="item" @edit="emit('edit-item', $event)"
          @delete="emit('delete-item', $event)" />
      </div>
    </div>
  </MlbModal>
</template>
