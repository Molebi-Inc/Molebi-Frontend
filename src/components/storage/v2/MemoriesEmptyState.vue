<template>
  <div class="flex flex-col items-center justify-center text-center py-16 px-6 h-full">
    <!-- Cloud upload illustration -->
    <div class="mb-6">
      <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="65" r="55" fill="#EEF0FB" />
        <!-- Scattered photo thumbnails -->
        <rect x="20" y="72" width="32" height="26" rx="4" fill="#F9A8C9" transform="rotate(-15 20 72)" />
        <rect x="108" y="68" width="32" height="26" rx="4" fill="#A5B4FC" transform="rotate(12 108 68)" />
        <rect x="55" y="88" width="28" height="22" rx="4" fill="#FCA5A5" transform="rotate(-5 55 88)" />
        <!-- Cloud -->
        <rect x="52" y="38" width="56" height="42" rx="8" fill="white" />
        <circle cx="68" cy="44" r="10" fill="#C7D2FE" />
        <circle cx="92" cy="44" r="10" fill="#C7D2FE" />
        <rect x="58" y="50" width="44" height="22" rx="0" fill="white" />
        <!-- Upload arrow -->
        <path d="M80 52 L80 70 M73 59 L80 52 L87 59" stroke="#6366F1" stroke-width="3" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
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
      class="flex items-center gap-2 px-6 py-3 bg-primary-700 text-white rounded-full text-sm font-semibold hover:bg-primary-800 transition-colors"
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
