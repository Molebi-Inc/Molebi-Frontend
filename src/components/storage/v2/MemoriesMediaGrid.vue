<template>
  <div class="relative">
    <div class="grid grid-cols-3 md:grid-cols-4 gap-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
        @click="$emit('item-click', item)"
      >
        <!-- Image / Video -->
        <img
          v-if="isVisual(item)"
          :src="item.thumbnail || item.url"
          :alt="item.file_name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
          @error="onThumbError"
        />
        <!-- Audio -->
        <div v-else class="w-full h-full bg-neutral-600 flex items-center justify-center">
          <img src="@/assets/images/audio-thumbnail.png" alt="Audio" class="w-24 h-24 object-contain opacity-95" />
        </div>
      </div>
    </div>

    <!-- Mobile FAB overlaid at bottom-right -->
    <slot name="fab" />
  </div>
</template>

<script setup lang="ts">
import type { AttachmentInterface } from '@/types/vault.types'
import emptyMemory from '@/assets/images/empty-memory.png'

defineProps<{ items: AttachmentInterface[] }>()
defineEmits<{ (e: 'item-click', item: AttachmentInterface): void }>()

const isVisual = (item: AttachmentInterface) =>
  item.mime_type?.startsWith('image/') || item.mime_type?.startsWith('video/')

const onThumbError = (e: Event) => {
  const img = e.target as HTMLImageElement | null
  if (!img) return
  if (img.src.includes(emptyMemory)) return
  img.src = emptyMemory
}
</script>
