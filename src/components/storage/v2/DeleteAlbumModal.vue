<template>
  <MlbModal :show="show" :bottom-sheet="isMobile" :bottom-sheet-height="400"
    @update:show="$emit('update:show', $event)">
    <template #header>
      <!-- Cancel link -->
      <button class="self-start text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-2"
        @click="$emit('update:show', false)">
        Cancel
      </button>
    </template>
    <div class="flex flex-col gap-1 py-1">

      <!-- Icon + content in dashed border -->
      <div class="rounded-2xl p-6 flex flex-col items-center text-center gap-3">
        <!-- Trash icon circle -->
        <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7H22M8 7V4H18V7M10 12V19M16 12V19M5 7L6 22H20L21 7H5Z" stroke="#EF4444" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <div>
          <h3 class="text-sm font-bold text-neutral-900">
            Confirm you want delete<br />
            <span class="text-neutral-700">"{{ albumName }}"</span>
          </h3>
          <p class="text-xs text-neutral-500 mt-2 leading-relaxed">
            This action will delete this file from your memories.
          </p>
        </div>
      </div>

      <!-- Delete button -->
      <button
        class="w-full mt-4 py-3.5 rounded-2xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
        :disabled="loading" @click="$emit('confirm')">
        {{ loading ? 'Deleting…' : 'Delete' }}
      </button>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import MlbModal from '@/components/ui/MlbModal.vue'

defineProps<{ show: boolean; albumName: string; loading?: boolean }>()

defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
</script>
