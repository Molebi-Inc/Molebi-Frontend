<template>
  <!-- Desktop sidebar variant -->
  <button v-if="variant === 'sidebar'"
    class="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left transition-colors hover:bg-neutral-50 cursor-pointer"
    @click="$emit('select')">
    <!-- Folder color swatch -->
    <div class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center">
      <img src="@/assets/images/folder-filled.png" alt="Album" class="w-full h-full object-cover" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-neutral-800 truncate">{{ album.name }}</p>
      <p class="text-xs text-neutral-400">{{ album.total_files }} files</p>
    </div>
  </button>

  <!-- Mobile list variant -->
  <button v-else
    class="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-neutral-100 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
    @click="$emit('select')">
    <!-- Album thumbnail -->
    <div class="w-12 h-12 rounded-xl shrink-0 overflow-hidden" :style="{ backgroundColor: folderColor + '33' }">
      <div class="w-full h-full flex items-center justify-center bg-white">

        <img src="@/assets/images/folder-filled.png" alt="Album" class="w-6 h-6 object-cover" />
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-neutral-900 truncate">{{ album.name }}</p>
      <p class="text-xs text-neutral-500 mt-0.5">{{ album.total_files.toLocaleString() }} files</p>
    </div>

    <!-- Member avatars -->
    <div v-if="album.creator" class="flex -space-x-1.5 shrink-0">
      <MlbAvatar :options="{
        firstname_field: 'name',
        users: album.creator
      }" :size="20" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
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
