<template>
  <aside class="w-[220px] flex-shrink-0 bg-white rounded-2xl p-3 space-y-1 self-start">
    <!-- All media item -->
    <button class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
      :class="activeAlbumId === null
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-700 hover:bg-neutral-50'
        " @click="$emit('select-all')">
      <MlbIcon name="vuesax.outline.folder-open" :size="18" />
      All media item
    </button>

    <!-- Album section -->
    <div>
      <div class="flex items-center justify-between px-3 py-2">
        <button
          class="flex items-center gap-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
          @click="$emit('select-all-albums')">
          <MlbIcon name="vuesax.outline.folder" :size="18" />
          Album
        </button>
        <button
          class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-800"
          title="Create new album" @click="$emit('create-album')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- Album list -->
      <div v-if="folders.length" class="space-y-0.5 mt-1">
        <MemoriesAlbumRow v-for="album in folders" :key="album.id" :album="album" variant="sidebar"
          :class="activeAlbumId === album.id ? 'bg-primary-50!' : ''" @select="$emit('select-album', album.id)" />
      </div>

      <!-- Helper text -->
      <p class="text-[11px] text-neutral-400 italic leading-snug px-2 mt-3">
        Group memories in albums so your family can easily explore by event and celebration. Click
        the plus "+" icon to add a new album.
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { StorageFolderInterface } from '@/types/storage.types'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MemoriesAlbumRow from './MemoriesAlbumRow.vue'

defineProps<{
  folders: StorageFolderInterface[]
  activeAlbumId: number | null
}>()

defineEmits<{
  (e: 'select-all'): void
  (e: 'select-all-albums'): void
  (e: 'select-album', id: number): void
  (e: 'create-album'): void
}>()
</script>
