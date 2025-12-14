<template>
  <div class="generation-label absolute z-5" :class="positionClass" :style="{ top: `${y}px` }">
    <div class="flex items-center gap-2">
      <div class="h-px bg-gray-300" :class="lineWidthClass" />
      <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ label }}
      </span>
      <div class="h-px bg-gray-300" :class="lineWidthClass" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  y: number
}

defineProps<Props>()

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

const positionClass = computed(() => {
  return isMobile.value ? 'left-2' : 'left-4'
})

const lineWidthClass = computed(() => {
  return isMobile.value ? 'w-8' : 'w-12'
})
</script>

<style scoped>
.generation-label {
  pointer-events: none;
}
</style>
