<template>
  <MlbModal
    :show="show"
    :bottom-sheet="isMobile"
    :bottom-sheet-height="state === 'success' ? 320 : 260"
    @update:show="onClose"
  >
    <!-- Form state -->
    <div v-if="state === 'form'" class="flex flex-col gap-4 py-1">
      <h3 class="text-base font-semibold text-neutral-900 text-center">Create New Album</h3>
      <input
        v-model="albumName"
        type="text"
        placeholder="Album Name"
        class="w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 placeholder-neutral-300"
        @keydown.enter="submit"
      />
      <button
        class="w-full py-3 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
        :disabled="!albumName.trim() || loading"
        @click="submit"
      >
        {{ loading ? 'Creating…' : 'Create' }}
      </button>
    </div>

    <!-- Success state -->
    <div v-else class="flex flex-col py-1">
      <!-- Back -->
      <button
        class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 mb-4 transition-colors self-start"
        @click="onClose"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Go back
      </button>

      <UploadSuccessState
        :title="`New Album &quot;${albumName}&quot; Created`"
        description="Now add photos, videos and audio documents to your album to make it easy for your family to explore and engage."
        action-label="Add Media"
        action-variant="solid"
        @action="onAddMedia"
      />
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import MlbModal from '@/components/ui/MlbModal.vue'
import UploadSuccessState from '@/components/shared/media/UploadSuccessState.vue'

defineProps<{ show: boolean; loading?: boolean }>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'create', name: string): void
  (e: 'add-media', albumName: string): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const state = ref<'form' | 'success'>('form')
const albumName = ref('')

const submit = () => {
  if (!albumName.value.trim()) return
  emit('create', albumName.value.trim())
}

// Called from parent after successful creation
const showSuccess = () => { state.value = 'success' }

const onAddMedia = () => {
  emit('add-media', albumName.value)
  resetAndClose()
}

const onClose = () => {
  emit('update:show', false)
  resetAndClose()
}

const resetAndClose = () => {
  setTimeout(() => {
    state.value = 'form'
    albumName.value = ''
  }, 300)
}

defineExpose({ showSuccess })
</script>
