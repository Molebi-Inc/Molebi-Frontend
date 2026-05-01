<template>
  <!-- Step 1: Content type selector -->
  <MlbModal v-if="step === 'type-select'" :show="show" :bottom-sheet="isMobile" :bottom-sheet-height="300"
    class="rounded-3xl!" @update:show="onClose">
    <template #header>
      <h3 class="text-center text-lg font-semibold text-neutral-800">Select your memory type</h3>
    </template>
    <MediaTypeSelector @select="onTypeSelect" />
  </MlbModal>

  <!-- Photo/Video flow -->
  <MlbModal v-else-if="step === 'photo-drop' || step === 'photo-preview'" :show="show" :bottom-sheet="isMobile"
    :bottom-sheet-height="400" class="rounded-3xl!" @update:show="onClose">
    <template #header>
      <div :class="['flex items-center', !isMobile ? 'justify-center' : 'justify-between']">
        <button v-if="isMobile" class="text-neutral-500 hover:text-neutral-800 transition-colors" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
        <h3 :class="[isMobile ? 'text-sm' : 'text-2xl', 'font-semibold text-neutral-800']">Add new memory</h3>
        <!-- <button class="text-neutral-400 hover:text-neutral-600 transition-colors" @click="onClose">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button> -->
        <div></div>
      </div>
    </template>
    <div class="flex flex-col gap-4 min-h-[280px]">
      <!-- Drop zone -->
      <MediaUploadDropzone v-if="step === 'photo-drop'" @files="onFilesAdded" />

      <!-- File preview grid -->
      <div v-else>
        <MediaFilesGrid :files="selectedFiles" @remove="removeFile" @add-more="showFilePicker" />
        <input ref="fileInputRef" type="file" accept="image/*,video/*" multiple class="hidden" @change="onMoreFiles" />
      </div>

      <button v-if="!!selectedFiles.length"
        class="mt-auto px-8 py-3 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-40"
        :disabled="selectedFiles.length === 0" @click="step = 'photo-meta'">
        Next
      </button>
    </div>
  </MlbModal>

  <!-- Photo metadata (wide modal on desktop) -->
  <MlbModal v-else-if="step === 'photo-meta'" :show="show" :bottom-sheet="isMobile" :bottom-sheet-height="540"
    :max-width="800" style="--modal-max-width: 860px" class="rounded-3xl!" @update:show="onClose">
    <template #header>
      <div class="flex items-center justify-between md:hidden">
        <button class="text-neutral-500 hover:text-neutral-800" @click="step = 'photo-preview'">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
        <h3 class="text-sm font-semibold text-neutral-800">Add new memory</h3>
        <button class="text-neutral-400" @click="onClose">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </template>
    <div class="flex flex-col md:flex-row gap-0 md:gap-6 md:h-[440px]">
      <!-- Left: photo carousel -->
      <div class="hidden md:flex flex-col flex-1 bg-neutral-900 rounded-xl overflow-hidden relative">
        <img v-if="currentPreview" :src="currentPreview" class="w-full h-full object-cover" alt="preview" />
        <div v-else class="w-full h-full flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M4 12V32C4 34.2 5.8 36 8 36H32C34.2 36 36 34.2 36 32V12C36 9.8 34.2 8 32 8H8C5.8 8 4 9.8 4 12Z"
              stroke="white" stroke-opacity="0.3" stroke-width="2" />
            <circle cx="14" cy="18" r="3" stroke="white" stroke-opacity="0.3" stroke-width="2" />
            <path d="M4 28L12 20L18 26L25 18L36 28" stroke="white" stroke-opacity="0.3" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <!-- Nav arrows -->
        <div v-if="selectedFiles.length > 1"
          class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
          <button
            class="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
            @click="prevFile">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7L9 3" stroke="white" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
          <button
            class="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
            @click="nextFile">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 11L9 7L5 3" stroke="white" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- Dot indicators -->
        <div v-if="selectedFiles.length > 1" class="absolute bottom-3 inset-x-0 flex justify-center gap-1">
          <div v-for="(_, i) in selectedFiles" :key="i" class="w-1.5 h-1.5 rounded-full transition-colors"
            :class="i === previewIndex ? 'bg-white' : 'bg-white/40'" />
        </div>
      </div>

      <!-- Right: metadata form -->
      <div class="flex-1 flex flex-col md:overflow-hidden md:py-1">
        <div class="flex-1 overflow-y-auto">
          <MemoryMetadataForm v-model="metadata" />
        </div>
        <button
          class="w-full py-3 mt-4 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-40"
          :disabled="!metadata.title.trim() || submitting" @click="submitMemory">
          {{ submitting ? 'Saving…' : 'Add Memory' }}
        </button>
      </div>
    </div>
  </MlbModal>

  <!-- Audio flow -->
  <MlbModal v-else-if="step === 'audio' || step === 'audio-meta'" :show="show" :bottom-sheet="isMobile"
    :bottom-sheet-height="step === 'audio-meta' ? 560 : 460" class="rounded-3xl!"
    :style="step === 'audio-meta' ? '--modal-max-width: 860px' : ''" @update:show="onClose">
    <template #header>
      <div class="flex items-center justify-between">
        <button class="text-neutral-500 hover:text-neutral-800 transition-colors" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
        <h3 class="text-sm md:text-2xl font-semibold text-neutral-800">Add new memory</h3>
        <button class="text-neutral-400 hover:text-neutral-600 transition-colors md:hidden" @click="onClose">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <div class="hidden md:block w-5" />
      </div>
    </template>
    <div class="flex flex-col md:flex-row gap-0 md:gap-6" :class="step === 'audio-meta' ? 'md:h-[440px]' : ''">
      <!-- Audio recorder / preview left panel -->
      <div :class="step === 'audio-meta' ? 'hidden md:flex flex-col flex-1' : 'flex-1'">

        <div v-if="step === 'audio-meta'"
          class="flex-1 flex flex-col items-center justify-center bg-neutral-800 rounded-2xl p-6">
          <!-- Audio visual placeholder -->
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 14V42M18 14L38 9V35M18 42C18 45.3 15.3 48 12 48C8.7 48 6 45.3 6 42C6 38.7 8.7 36 12 36C15.3 36 18 38.7 18 42ZM38 35C38 38.3 35.3 41 32 41C28.7 41 26 38.3 26 35C26 31.7 28.7 29 32 29C35.3 29 38 31.7 38 35Z"
              stroke="white" stroke-opacity="0.6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <AudioPreviewPlayer v-if="recordedAudio" :audio-url="recordedAudio.url" class="mt-4 w-full" />
        </div>
        <AudioRecorder v-else @ready="onAudioReady" />

        <button v-if="step !== 'audio-meta'"
          class="w-full py-3 mt-4 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-40"
          :disabled="!recordedAudio" @click="step = 'audio-meta'">
          Next
        </button>
      </div>

      <!-- Metadata form (right on desktop, full on mobile) -->
      <div v-if="step === 'audio-meta'" class="flex-1 flex flex-col md:overflow-hidden md:py-1">
        <!-- Mobile: show audio player on metadata screen too -->
        <div v-if="recordedAudio" class="md:hidden mb-2">
          <AudioPreviewPlayer :audio-url="recordedAudio.url" />
        </div>

        <div class="flex-1 overflow-y-auto">
          <MemoryMetadataForm v-model="metadata" />
        </div>
        <button
          class="w-full py-3 mt-4 rounded-4xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-40"
          :disabled="!metadata.title.trim() || submitting" @click="submitMemory">
          {{ submitting ? 'Saving…' : 'Add Memory' }}
        </button>
      </div>
    </div>
  </MlbModal>

  <!-- Success -->
  <MlbModal v-else-if="step === 'success'" :show="show" :bottom-sheet="isMobile" :bottom-sheet-height="300"
    :headerless="true" class="rounded-3xl!" @update:show="onClose">
    <UploadSuccessState :title="successType === 'audio' ? 'Audio Uploaded' : 'File Uploaded'" :description="successType === 'audio'
      ? 'You have successfully uploaded a new audio file to memory.'
      : 'You have successfully uploaded a new file to memory.'" action-label="Close" action-variant="outline"
      @action="onClose" />
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import MlbModal from '@/components/ui/MlbModal.vue'
import MediaTypeSelector from '@/components/shared/media/MediaTypeSelector.vue'
import MediaUploadDropzone from '@/components/shared/media/MediaUploadDropzone.vue'
import MediaFilesGrid from '@/components/shared/media/MediaFilesGrid.vue'
import MemoryMetadataForm from '@/components/shared/media/MemoryMetadataForm.vue'
import AudioRecorder from '@/components/shared/media/AudioRecorder.vue'
import AudioPreviewPlayer from '@/components/shared/media/AudioPreviewPlayer.vue'
import UploadSuccessState from '@/components/shared/media/UploadSuccessState.vue'
import type { RecordedAudio } from '@/components/shared/media/AudioRecorder.vue'
import type { CreateMemoryValues } from '@/types/memory.types'

const props = withDefaults(defineProps<{
  show: boolean
  initialType?: 'photo-video' | 'audio' | null
  submitHandler?: (data: FormData) => Promise<void> | void
}>(), {
  initialType: null,
  submitHandler: undefined,
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')

type Step =
  | 'type-select'
  | 'photo-drop'
  | 'photo-preview'
  | 'photo-meta'
  | 'audio'
  | 'audio-meta'
  | 'success'

const step = ref<Step>('type-select')
const selectedFiles = ref<File[]>([])
const recordedAudio = ref<RecordedAudio | null>(null)
const previewIndex = ref(0)
const submitting = ref(false)
const successType = ref<'photo' | 'audio'>('photo')
const fileInputRef = ref<HTMLInputElement | null>(null)

const metadata = ref<CreateMemoryValues>({
  title: '',
  description: '',
  family_member_ids: [],
  event_date: null,
  files: [],
  metadata: { location: '' },
})

const currentPreview = computed(() => {
  const file = selectedFiles.value[previewIndex.value]
  if (!file || !file.type.startsWith('image/')) return null
  return URL.createObjectURL(file)
})

const onTypeSelect = (type: 'photo-video' | 'audio') => {
  step.value = type === 'photo-video' ? 'photo-drop' : 'audio'
}

const onFilesAdded = (files: File[]) => {
  selectedFiles.value = [...selectedFiles.value, ...files]
  step.value = 'photo-preview'
}

const removeFile = (i: number) => {
  selectedFiles.value = selectedFiles.value.filter((_, idx) => idx !== i)
  if (selectedFiles.value.length === 0) step.value = 'photo-drop'
}

const showFilePicker = () => fileInputRef.value?.click()

const onMoreFiles = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  selectedFiles.value = [...selectedFiles.value, ...files]
    ; (e.target as HTMLInputElement).value = ''
}

const prevFile = () => { if (previewIndex.value > 0) previewIndex.value-- }
const nextFile = () => { if (previewIndex.value < selectedFiles.value.length - 1) previewIndex.value++ }

const onAudioReady = (audio: RecordedAudio | null) => {
  recordedAudio.value = audio
}

const goBack = () => {
  if (step.value === 'photo-drop' || step.value === 'audio') step.value = 'type-select'
  else if (step.value === 'photo-preview') step.value = 'photo-drop'
  else if (step.value === 'photo-meta') step.value = 'photo-preview'
  else if (step.value === 'audio-meta') step.value = 'audio'
}

const submitMemory = async () => {
  submitting.value = true
  const isAudio = step.value === 'audio-meta'
  const files: File[] =
    isAudio && recordedAudio.value
      ? [new File([recordedAudio.value.blob], 'recording.webm', { type: 'audio/webm' })]
      : selectedFiles.value

  try {
    const formData = new FormData()
    formData.append('title', metadata.value.title)
    formData.append('description', metadata.value.description ?? '')
    if (metadata.value.event_date !== null) {
      formData.append('event_date', metadata.value.event_date)
    }
    metadata.value.family_member_ids.forEach((id) => formData.append('family_member_ids[]', String(id)))
    formData.append('metadata[location]', metadata.value.metadata.location)
    files.forEach((file) => formData.append('files[]', file))
    if (!props.submitHandler) return
    await props.submitHandler(formData)
    successType.value = isAudio ? 'audio' : 'photo'
    step.value = 'success'
  } finally {
    submitting.value = false
  }
}

const onClose = () => {
  emit('update:show', false)
  setTimeout(() => {
    step.value = 'type-select'
    selectedFiles.value = []
    recordedAudio.value = null
    previewIndex.value = 0
    metadata.value = {
      title: '',
      description: '',
      family_member_ids: [],
      event_date: null,
      files: [],
      metadata: { location: '' },
    }
  }, 300)
}

watch(
  () => props.show,
  (show) => {
    if (!show) return
    step.value =
      props.initialType === 'audio'
        ? 'audio'
        : props.initialType === 'photo-video'
          ? 'photo-drop'
          : 'type-select'
  },
)
</script>
