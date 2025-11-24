<template>
  <div class="space-y-6">
    <div class="max-w-3xl mx-auto py-3 border-y border-gray-300">
      <div class="flex items-start justify-between gap-6">
        <div class="flex-1 min-w-0">
          <div class="text-[10px] font-semibold text-gray-600">Created by:</div>
          <div class="mt-1 text-xs font-medium text-gray-700 truncate">
            {{ tradition.family_tree?.name || 'Molebi User' }}
          </div>
        </div>

        <div class="flex-1 min-w-0 text-right">
          <div class="text-[10px] font-semibold text-gray-600">Happening:</div>
          <div class="mt-1 text-xs font-medium text-gray-700">{{ tradition.created_at }}</div>
        </div>
      </div>
    </div>
    <div class="space-y-4">
      <div v-if="tradition.images.length > 0">
        <span class="text-[10px] font-medium text-gray-500 mb-3"
          >Photos from {{ tradition.title.toLowerCase() }}</span
        >
        <n-scrollbar x-scrollable>
          <div v-for="photo in tradition.images" :key="photo.id">
            <img :src="photo.url" alt="Photo" class="w-26 h-26 rounded-xl" />
          </div>
        </n-scrollbar>
      </div>
      <div v-if="tradition.audios.length > 0">
        <span class="text-[10px] font-medium text-gray-500 mb-3"
          >Audio records from {{ tradition.title.toLowerCase() }}</span
        >
        <n-scrollbar x-scrollable>
          <div v-for="audio in tradition.audios" :key="audio.id">
            <audio :src="audio.url" alt="Audio" class="w-26 h-26 rounded-xl" />
          </div>
        </n-scrollbar>
      </div>
    </div>
    <div>
      <MlbButton
        type="button"
        block
        label="Add a New Memory"
        class="rounded-2xl! bg-primary-50! h-13! text-primary-700!"
        @click="handleAddNewMemory"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { NScrollbar } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'
import type { FamilyTradition } from '@/types/family-tradition.types'
import { useFamilyTraditionStore } from '@/stores/family-tradition.store'

const $route = useRoute()
const $router = useRouter()
const traditionStore = useFamilyTraditionStore()

const props = defineProps<{
  tradition: FamilyTradition
}>()

const emit = defineEmits<{
  (e: 'newMemory'): void
}>()

const handleAddNewMemory = () => {
  emit('newMemory')
  traditionStore.setStoreProp('selectedFamilyTradition', props.tradition)
  $router.push({
    name: $route.name,
    query: { ftype: 'family_tradition_media' },
  })
}
</script>
