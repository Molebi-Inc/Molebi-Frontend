<template>
  <div class="flex flex-col items-center justify-center text-center py-16 px-6 h-full">
    <!-- Cloud upload illustration -->
    <div class="mb-6">
      <!-- Scattered photo thumbnails -->
      <img src="@/assets/images/empty-memory.png" alt="Scattered photos" class="w-full h-full object-cover" />
    </div>

    <h3 class="text-base font-bold text-neutral-900 mb-2">
      {{ albumName ? "You don't have any memory in the album" : 'Your family story starts here.' }}
    </h3>
    <p class="text-xs text-neutral-500 max-w-[260px] mb-6 leading-relaxed">
      {{
        albumName
          ? `Save photos, videos, audios or voice note, related to ${albumName} event.`
          : "Save your important moments here so they remain in your family forever. Every photo, every voice note, every document tells a story."
      }}
    </p>

    <button
      class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-800 transition-colors cursor-pointer"
      @click="$emit('add')">
      <span class="text-base leading-none">+</span>
      {{ albumName ? 'Upload First Memory' : 'Add your first memory' }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ albumName?: string }>()
defineEmits<{ (e: 'add'): void }>()
</script>
