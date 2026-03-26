<template>
  <MlbModal :show="show" :bottom-sheet="isMobile" :bottom-sheet-height="state === 'success' ? 320 : 260"
    @update:show="onClose">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <BackButton :label="!isMobile ? 'Go Back' : 'Cancel'" :icon="!isMobile ? 'vuesax.linear.arrow-left' : ''"
            class="mb-6" :previous-route="false" @update:go-back="onClose" />
        </div>
        <div v-if="state === 'form'">
          <h1 class="text-base font-bold text-gray-900 text-center md:hidden">
            New Album
          </h1>
        </div>
        <div>
          <span v-if="state != 'form'" role="button" class="text-sm underline text-[#2B892B]" @click="onViewAlbum">View
            Album</span>
        </div>
      </div>
    </template>
    <!-- Form state -->
    <div v-if="state === 'form'" class="flex flex-col gap-4 py-1">
      <input v-model="albumName" type="text" placeholder="Album Name"
        class="w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 placeholder-neutral-300 borderless"
        @keydown.enter="submit" />
      <button
        class="w-full py-3 rounded-4xl bg-primary text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
        :disabled="!albumName.trim() || loading" @click="submit">
        {{ loading ? 'Creating…' : 'Proceed' }}
      </button>
    </div>

    <!-- Success state -->
    <div v-else class="flex flex-col py-1">
      <!-- Back -->
      <button
        class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 mb-4 transition-colors self-start"
        @click="onClose">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        Go back
      </button>

      <UploadSuccessState :title="`New Album &quot;${albumName}&quot; Created`"
        description="Now add photos, videos and audio documents to your album to make it easy for your family to explore and engage."
        action-label="Add Media" action-variant="solid" @action="onAddMedia" />
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import UploadSuccessState from '@/components/shared/media/UploadSuccessState.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ show: boolean; loading?: boolean, albumId?: null | number }>()

const $router = useRouter()
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

const onViewAlbum = () => {
  $router.push({ name: 'App.StorageFolderDetailsView', params: { id: props.albumId } })
  onClose()
}

const resetAndClose = () => {
  setTimeout(() => {
    state.value = 'form'
    albumName.value = ''
  }, 300)
}

defineExpose({ showSuccess })
</script>
<style scoped>
.borderless {
  border: none;
  font-size: 24px !important;
  font-weight: 700 !important;
  color: #bababa !important;
  line-height: 150% !important;
  font-family: General Sans;

}
</style>