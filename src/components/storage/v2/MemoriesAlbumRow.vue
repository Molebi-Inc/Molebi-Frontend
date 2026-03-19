<template>
  <!-- Desktop sidebar variant -->
  <button
    v-if="variant === 'sidebar'"
    class="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left transition-colors hover:bg-neutral-50"
    @click="$emit('select')"
  >
    <!-- Folder color swatch -->
    <div
      class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
      :style="{ backgroundColor: folderColor + '22' }"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.5 4.5C1.5 3.67 2.17 3 3 3H6.38C6.72 3 7.04 3.15 7.25 3.41L8.25 4.59C8.46 4.85 8.78 5 9.12 5H13C13.83 5 14.5 5.67 14.5 6.5V12C14.5 12.83 13.83 13.5 13 13.5H3C2.17 13.5 1.5 12.83 1.5 12V4.5Z"
          :fill="folderColor"
          fill-opacity="0.9"
        />
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-neutral-800 truncate">{{ album.name }}</p>
      <p class="text-xs text-neutral-400">{{ album.total_files }} files</p>
    </div>
  </button>

  <!-- Mobile list variant -->
  <button
    v-else
    class="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-neutral-100 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
    @click="$emit('select')"
  >
    <!-- Album thumbnail -->
    <div
      class="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden"
      :style="!thumbnailUrl ? { backgroundColor: folderColor + '33' } : {}"
    >
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="album.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
        :style="{ backgroundColor: folderColor + '22' }"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 7C2 5.9 2.9 5 4 5H9.17C9.7 5 10.21 5.21 10.59 5.59L11.41 6.41C11.79 6.79 12.3 7 12.83 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V7Z"
            :fill="folderColor"
            fill-opacity="0.8"
          />
        </svg>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-neutral-900 truncate">{{ album.name }}</p>
      <p class="text-xs text-neutral-500 mt-0.5">{{ album.total_files.toLocaleString() }} files</p>
    </div>

    <!-- Member avatars -->
    <div v-if="album.media?.length" class="flex -space-x-1.5 flex-shrink-0">
      <div
        v-for="(_, i) in Math.min(album.media.length, 3)"
        :key="i"
        class="w-6 h-6 rounded-full bg-neutral-200 border-2 border-white overflow-hidden"
      >
        <img
          v-if="album.media[i]?.thumbnail"
          :src="album.media[i].thumbnail!"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-if="album.media.length > 3"
        class="w-6 h-6 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center"
      >
        <span class="text-[9px] font-semibold text-neutral-500">+{{ album.media.length - 3 }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StorageFolderInterface } from '@/types/storage.types'

const props = withDefaults(
  defineProps<{
    album: StorageFolderInterface
    variant?: 'sidebar' | 'list'
  }>(),
  { variant: 'list' },
)

defineEmits<{ (e: 'select'): void }>()

const FOLDER_COLORS = ['#16A34A', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#0891B2']

const folderColor = computed(
  () => props.album.color_code || FOLDER_COLORS[props.album.id % FOLDER_COLORS.length],
)

const thumbnailUrl = computed(() => {
  const first = props.album.media?.find(
    (m) => m.mime_type?.startsWith('image/') || m.thumbnail,
  )
  return first?.thumbnail || first?.url || null
})
</script>
