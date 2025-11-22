<template>
  <div class="tree-controls absolute z-10 flex gap-2" :class="positionClass">
    <!-- Zoom Controls -->
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-200 flex"
      :class="isMobile ? 'p-0.5' : 'p-1'"
    >
      <button
        class="hover:bg-gray-50 rounded-md text-gray-600 transition-colors"
        :class="isMobile ? 'p-1.5' : 'p-2'"
        title="Zoom In"
        @click="$emit('zoom-in')"
      >
        <MlbIcon name="vuesax.linear.add" :size="isMobile ? 18 : 20" />
      </button>
      <div class="w-px bg-gray-200" :class="isMobile ? 'my-0.5' : 'my-1'" />
      <button
        class="hover:bg-gray-50 rounded-md text-gray-600 transition-colors"
        :class="isMobile ? 'p-1.5' : 'p-2'"
        title="Zoom Out"
        @click="$emit('zoom-out')"
      >
        <MlbIcon name="vuesax.linear.minus" :size="isMobile ? 18 : 20" />
      </button>
      <div v-if="!isMobile" class="w-px bg-gray-200 my-1" />
      <button
        v-if="!isMobile"
        class="p-2 hover:bg-gray-50 rounded-md text-gray-600 transition-colors"
        title="Reset Zoom"
        @click="$emit('zoom-reset')"
      >
        <MlbIcon name="vuesax.linear.refresh" :size="20" />
      </button>
    </div>

    <!-- Share Button - Hidden on mobile -->
    <MlbButton v-if="!isMobile" label="Share Tree" secondary size="small" @click="$emit('share')">
      <template #icon>
        <MlbIcon name="vuesax.linear.export" :size="16" class="mr-1" />
      </template>
    </MlbButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'

defineEmits<{
  'zoom-in': []
  'zoom-out': []
  'zoom-reset': []
  share: []
}>()

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

const positionClass = computed(() => {
  return isMobile.value ? 'top-2 right-2' : 'top-4 right-4'
})
</script>

<style scoped>
.tree-controls {
  pointer-events: auto;
}
</style>
