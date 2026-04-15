<template>
  <div class="rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors" :class="[
    isDragging ? 'border-primary-400 bg-primary-50' : 'border-blue-300 bg-blue-50/20',
    compact ? 'p-6 min-h-[160px]' : 'p-10 min-h-[220px]',
  ]" @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="onDrop"
    @click="triggerInput">
    <!-- Illustration -->
    <div class="w-25 h-25 flex items-center justify-center">
      <img src="@/assets/images/empty-memory.png" alt="Scattered photos" class="w-25 h-25 object-cover" />
    </div>

    <div class="text-center">
      <p :class="['font-medium text-neutral-700', isMobile ? 'text-sm' : 'text-2xl']">{{ label }}</p>
    </div>

    <button type="button"
      class="px-5 py-2 bg-primary-700 text-white rounded-full text-sm font-medium hover:bg-primary-800 transition-colors"
      @click.stop="triggerInput">
      Select from computer
    </button>

    <input ref="inputRef" type="file" :accept="accept" multiple class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const isMobile = useMediaQuery('(max-width: 767px)')

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
    ; (e.target as HTMLInputElement).value = ''
}
</script>
