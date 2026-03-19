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
        />
        <!-- Audio -->
        <div v-else class="w-full h-full bg-neutral-600 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 9V27M12 9L26 6V24M12 27C12 29.2 10.2 31 8 31C5.8 31 4 29.2 4 27C4 24.8 5.8 23 8 23C10.2 23 12 24.8 12 27ZM26 24C26 26.2 24.2 28 22 28C19.8 28 18 26.2 18 24C18 21.8 19.8 20 22 20C24.2 20 26 21.8 26 24Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Mobile FAB overlaid at bottom-right -->
    <slot name="fab" />
  </div>
</template>

<script setup lang="ts">
import type { AttachmentInterface } from '@/types/vault.types'

defineProps<{ items: AttachmentInterface[] }>()
defineEmits<{ (e: 'item-click', item: AttachmentInterface): void }>()

const isVisual = (item: AttachmentInterface) =>
  item.mime_type?.startsWith('image/') || item.mime_type?.startsWith('video/')
</script>
