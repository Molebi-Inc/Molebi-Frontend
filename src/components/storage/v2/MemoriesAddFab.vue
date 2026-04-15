<template>
  <div class="fixed bottom-6 right-4 z-30 flex flex-col items-end gap-3">
    <!-- Speed dial options -->
    <Transition name="fab-options">
      <div v-if="open" class="flex flex-col items-end gap-2">
        <button
          class="flex items-center gap-2 bg-white shadow-lg rounded-full pl-4 pr-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
          @click="emit('add-audio'); open = false"
        >
          Add Audio
          <div class="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 3V11M5 3L11 1.5V9.5M5 11C5 12.1 4.1 13 3 13C1.9 13 1 12.1 1 11C1 9.9 1.9 9 3 9C4.1 9 5 9.9 5 11ZM11 9.5C11 10.6 10.1 11.5 9 11.5C7.9 11.5 7 10.6 7 9.5C7 8.4 7.9 7.5 9 7.5C10.1 7.5 11 8.4 11 9.5Z"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </button>

        <button
          class="flex items-center gap-2 bg-white shadow-lg rounded-full pl-4 pr-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
          @click="emit('add-media'); open = false"
        >
          Add Photos/Videos
          <div class="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="white" stroke-width="1.5" />
              <circle cx="5.5" cy="7" r="1.5" stroke="white" stroke-width="1.5" />
              <path d="M1 11L5 8L8 10.5L11 8L15 11" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </button>
      </div>
    </Transition>

    <!-- Main FAB -->
    <button
      class="w-13 h-13 rounded-full bg-primary-700 text-white shadow-lg flex items-center justify-center hover:bg-primary-800 transition-all"
      :class="open ? 'rotate-45' : ''"
      @click="open = !open"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4V20M4 12H20" stroke="white" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const emit = defineEmits<{
  (e: 'add-media'): void
  (e: 'add-audio'): void
}>()
</script>

<style scoped>
.fab-options-enter-active,
.fab-options-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fab-options-enter-from,
.fab-options-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
