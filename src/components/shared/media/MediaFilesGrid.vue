<template>
  <div>
    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="(file, i) in files"
        :key="i"
        class="aspect-square rounded-xl overflow-hidden relative group"
      >
        <!-- Image preview -->
        <img
          v-if="previews[i] && isImage(file)"
          :src="previews[i]"
          :alt="file.name"
          class="w-full h-full object-cover"
        />
        <!-- Video preview -->
        <div v-else-if="isVideo(file)" class="w-full h-full bg-neutral-800 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="10" fill="white" fill-opacity="0.2" />
            <path d="M11 10L21 14L11 18V10Z" fill="white" />
          </svg>
        </div>
        <!-- Fallback -->
        <div v-else class="w-full h-full bg-neutral-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="#9CA3AF" stroke-width="1.5" /><path d="M8 10L12 14L16 10" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" /></svg>
        </div>

        <!-- Remove button -->
        <button
          class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          @click="$emit('remove', i)"
        >
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2L8 8M8 2L2 8" stroke="white" stroke-width="1.5" stroke-linecap="round" /></svg>
        </button>
      </div>

      <!-- Add more -->
      <button
        class="aspect-square rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-colors"
        @click="$emit('add-more')"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 4V20M4 12H20" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ files: File[] }>()
defineEmits<{ (e: 'remove', index: number): void; (e: 'add-more'): void }>()

const isImage = (f: File) => f.type.startsWith('image/')
const isVideo = (f: File) => f.type.startsWith('video/')

const previews = computed(() =>
  props.files.map((f) => (isImage(f) ? URL.createObjectURL(f) : null)),
)
</script>
