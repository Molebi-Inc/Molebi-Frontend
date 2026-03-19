<template>
  <div
    class="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors"
    :class="[
      isDragging ? 'border-primary-400 bg-primary-50' : 'border-blue-300 bg-blue-50/20',
      compact ? 'p-6 min-h-[160px]' : 'p-10 min-h-[220px]',
    ]"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="triggerInput"
  >
    <!-- Illustration -->
    <div class="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Scattered photos illustration -->
        <rect x="4" y="12" width="12" height="10" rx="2" fill="#C4B5FD" transform="rotate(-10 4 12)" />
        <rect x="16" y="14" width="12" height="10" rx="2" fill="#A5B4FC" transform="rotate(8 16 14)" />
        <circle cx="16" cy="11" r="7" fill="#7C3AED" fill-opacity="0.15" />
        <path d="M16 7V15M13 10L16 7L19 10" stroke="#7C3AED" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <div class="text-center">
      <p class="text-sm font-medium text-neutral-700">{{ label }}</p>
    </div>

    <button
      type="button"
      class="px-5 py-2 bg-primary-700 text-white rounded-full text-sm font-medium hover:bg-primary-800 transition-colors"
      @click.stop="triggerInput"
    >
      Select from computer
    </button>

    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      multiple
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    accept?: string
    label?: string
    compact?: boolean
  }>(),
  {
    accept: 'image/*,video/*',
    label: 'Drag photos and videos here',
    compact: false,
  },
)

const emit = defineEmits<{ (e: 'files', files: File[]): void }>()

const isDragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const triggerInput = () => inputRef.value?.click()

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length) emit('files', files)
}

const onFileChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (files.length) emit('files', files)
  ;(e.target as HTMLInputElement).value = ''
}
</script>
