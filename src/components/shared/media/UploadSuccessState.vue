<template>
  <div class="flex flex-col items-center text-center px-4 gap-4">
    <!-- Checkmark circle -->
    <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
      <div class="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12L10 17L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <div>
      <h3 class="text-base font-semibold text-neutral-900">{{ title }}</h3>
      <p class="text-xs text-neutral-500 mt-1 max-w-[240px] leading-relaxed">{{ description }}</p>
    </div>

    <button v-if="actionLabel" class="px-6 py-2.5 rounded-full text-sm font-semibold transition-colors" :class="actionVariant === 'outline'
      ? 'border border-primary-700 text-primary-700 hover:bg-primary-50'
      : 'bg-primary-700 text-white hover:bg-primary-800'" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    actionLabel?: string
    actionVariant?: 'solid' | 'outline'
  }>(),
  {
    title: 'File Uploaded',
    description: 'You have successfully uploaded a new file to memory.',
    actionLabel: 'Close',
    actionVariant: 'outline',
  },
)
defineEmits<{ (e: 'action'): void }>()
</script>
