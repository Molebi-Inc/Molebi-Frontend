<script setup lang="ts">
defineEmits<{ (e: 'open-menu'): void }>()
</script>

<template>
  <header class="border-b border-neutral-100 flex items-center justify-between px-4 py-3 sticky top-0 z-30">
    <!-- 2×2 grid / apps icon -->
    <button class="text-neutral-600 p-1" @click="$emit('open-menu')">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
        <rect x="12.5" y="2" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
        <rect x="2" y="12.5" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
        <rect x="12.5" y="12.5" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
      </svg>
    </button>

    <img src="@/assets/svg/logo.svg" alt="Mòlèbì" class="h-8 w-auto" />

    <!-- Mail / inbox icon -->
    <button class="text-neutral-600 p-1">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="18" height="13" rx="2" />
        <path d="M2 8l9 5.5L20 8" />
      </svg>
    </button>
  </header>
</template>
