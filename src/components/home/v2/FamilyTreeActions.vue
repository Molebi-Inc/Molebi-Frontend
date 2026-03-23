<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'

const emit = defineEmits<{
  (e: 'add-relative' | 'add-memory' | 'explore-culture'): void
}>()

const actions = [
  {
    label: 'Add relative',
    icon: 'vuesax.linear.people',
    event: 'add-relative' as const,
  },
  {
    label: 'Add a memory',
    icon: 'memory',
    event: 'add-memory' as const,
  },
  {
    label: 'Explore culture',
    icon: 'culture',
    event: 'explore-culture' as const,
  },
]
</script>

<template>
  <div class="bg-secondary-100 rounded-2xl p-4">
    <h3 class="text-base font-bold text-neutral-900 mb-3">Family tree actions</h3>
    <div class="flex items-center gap-3">
      <button v-for="action in actions" :key="action.label"
        class="flex-1 flex flex-col items-center gap-2 bg-white rounded-xl p-3 shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @click="emit(action.event)">
        <div class="w-11 h-11 rounded-xl  flex items-center justify-center">
          <MlbIcon :name="action.icon" :size="22" class="text-primary-700" />
        </div>
        <span class="text-xs font-medium text-neutral-700 text-center leading-tight whitespace-nowrap">
          {{ action.label }}
        </span>
      </button>
    </div>
  </div>
</template>
