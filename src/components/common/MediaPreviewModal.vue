<template>
  <MlbModal
    v-model:show="localShowPreviewModal"
    :full-page="true"
    class="full-page-modal! bg-black/90!"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center justify-between w-full gap-2">
        <div class="flex items-center gap-3 w-[50%]">
          <MlbButton text secondary class="text-white! text-sm" @click="handleClose()">
            <template #icon>
              <MlbIcon
                name="vuesax.linear.add"
                :size="20"
                color="#FFFFFF"
                class="mr-2! rotate-45!"
              />
            </template>
          </MlbButton>
          <h2
            class="text-xl font-semibold truncate text-white w-full"
            :title="selectedMedia?.file_name || 'Media Preview'"
          >
            {{ selectedMedia?.file_name || 'Media Preview' }}
          </h2>
        </div>
        <MlbButton
          text
          label="Download"
          secondary
          class="text-white! text-sm! hover:bg-black/50! transition-colors! gap-2! download-button!"
          @click="downloadMedia()"
        >
          <template #icon>
            <MlbIcon
              name="vuesax.broken.document-download"
              :size="20"
              color="#FFFFFF"
              class="mr-2!"
            />
          </template>
        </MlbButton>
      </div>
    </template>
    <div class="relative h-full flex flex-col">
      <button
        v-if="
          canNavigatePrevious &&
          selectedMedia &&
          (getMediaType(selectedMedia.mime_type) === 'image' ||
            getMediaType(selectedMedia.mime_type) === 'video')
        "
        @click="navigatePrevious"
        class="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full shadow-lg flex items-center justify-center transition-colors backdrop-blur-sm text-white"
        aria-label="Previous"
      >
        <MlbIcon name="vuesax.linear.arrow-left" :size="24" color="#FFFFFF" />
      </button>
      <button
        v-if="
          canNavigateNext &&
          selectedMedia &&
          (getMediaType(selectedMedia.mime_type) === 'image' ||
            getMediaType(selectedMedia.mime_type) === 'video')
        "
        @click="navigateNext"
        class="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full shadow-lg flex items-center justify-center transition-colors backdrop-blur-sm text-white"
        aria-label="Next"
      >
        <MlbIcon name="vuesax.linear.arrow-right" :size="24" color="#FFFFFF" />
      </button>

      <div class="media-preview-modal h-full">
        <!-- Image Preview -->
        <div
          v-if="selectedMedia && getMediaType(selectedMedia.mime_type) === 'image'"
          class="relative flex items-center justify-center h-full"
        >
          <img
            :src="selectedMedia?.url"
            :alt="selectedMedia?.name || 'Image'"
            class="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        <!-- Video Preview -->
        <div
          v-else-if="selectedMedia && getMediaType(selectedMedia.mime_type) === 'video'"
          class="relative h-full flex flex-col"
        >
          <div class="relative bg-black overflow-hidden flex-1 flex items-center justify-center">
            <video
              ref="videoElement"
              :src="selectedMedia.url"
              :poster="selectedMedia.thumbnail || ''"
              class="w-full h-full object-contain"
              @loadedmetadata="onVideoLoaded"
              @timeupdate="onVideoTimeUpdate"
              @play="onVideoPlay"
              @pause="onVideoPause"
            >
              Your browser does not support the video tag.
            </video>

            <!-- Play Button Overlay -->
            <div
              v-if="!isVideoPlaying"
              class="absolute inset-0 flex items-center justify-center cursor-pointer"
              @click="toggleVideoPlay"
            >
              <div
                class="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              >
                <MlbIcon name="vuesax.bold.play-circle" :size="32" color="black" />
              </div>
            </div>
          </div>

          <!-- Video Controls -->
          <div class="mt-4 px-2 pb-4">
            <!-- Progress Bar -->
            <div class="relative mb-3">
              <input
                type="range"
                min="0"
                :max="Math.max(videoDuration, 0.1)"
                :value="videoCurrentTime"
                @input="handleVideoTimeChange"
                class="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style="-webkit-appearance: none; appearance: none"
              />
              <div
                class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md cursor-pointer"
                :style="{ left: `${(videoCurrentTime / Math.max(videoDuration, 0.1)) * 100}%` }"
              ></div>
            </div>

            <!-- Timestamps and Controls -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-white font-mono">{{ formatTime(videoCurrentTime) }}</span>

              <div class="flex items-center gap-4">
                <!-- Rewind 15s -->
                <button
                  @click="rewindVideo"
                  class="flex flex-col items-center text-white hover:text-gray-400 transition cursor-pointer"
                >
                  <div
                    class="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center mb-1"
                  >
                    <span class="text-xs font-semibold">15</span>
                  </div>
                </button>

                <!-- Play/Pause -->
                <button
                  @click="toggleVideoPlay"
                  class="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <MlbIcon
                    v-if="!isVideoPlaying"
                    name="vuesax.bold.play-circle"
                    :size="24"
                    color="black"
                  />
                  <MlbIcon v-else name="vuesax.bold.pause-circle" :size="24" color="black" />
                </button>

                <!-- Fast Forward 15s -->
                <button
                  @click="forwardVideo"
                  class="flex flex-col items-center text-white hover:text-gray-400 transition cursor-pointer"
                >
                  <div
                    class="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center mb-1"
                  >
                    <span class="text-xs font-semibold">15</span>
                  </div>
                </button>
              </div>

              <span class="text-sm text-white font-mono">{{ formatTime(videoDuration) }}</span>
            </div>
          </div>
        </div>

        <!-- Audio Preview -->
        <div
          v-else-if="selectedMedia && getMediaType(selectedMedia.mime_type) === 'audio'"
          class="flex flex-col items-center justify-center h-full py-12"
        >
          <!-- Large Musical Note Icon -->
          <div
            class="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-8 relative cursor-pointer"
          >
            <img
              src="@/assets/images/audio-thumbnail.png"
              alt="Audio"
              class="w-48 h-48 object-contain"
            />
            <div
              v-if="!isAudioPlaying"
              class="absolute inset-0 flex items-center justify-center cursor-pointer"
              @click="toggleAudioPlay"
            >
              <div
                class="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              >
                <MlbIcon name="vuesax.bold.play-circle" :size="32" color="black" />
              </div>
            </div>
          </div>

          <!-- Audio Controls -->
          <div class="w-full max-w-md px-4">
            <!-- Progress Bar -->
            <div class="relative mb-3">
              <input
                type="range"
                min="0"
                :max="Math.max(audioDuration, 0.1)"
                :value="audioCurrentTime"
                @input="handleAudioTimeChange"
                class="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style="-webkit-appearance: none; appearance: none"
              />
              <div
                class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md cursor-pointer"
                :style="{ left: `${(audioCurrentTime / Math.max(audioDuration, 0.1)) * 100}%` }"
              ></div>
            </div>

            <!-- Timestamps and Controls -->
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm text-white font-mono">{{ formatTime(audioCurrentTime) }}</span>

              <div class="flex items-center gap-4">
                <!-- Rewind 15s -->
                <button
                  @click="rewindAudio"
                  class="flex flex-col items-center text-white hover:text-gray-800 transition cursor-pointer"
                >
                  <div
                    class="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center mb-1 text-white"
                  >
                    <span class="text-xs font-semibold">15</span>
                  </div>
                </button>

                <!-- Play/Pause -->
                <button
                  @click="toggleAudioPlay"
                  class="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <MlbIcon
                    v-if="!isAudioPlaying"
                    name="vuesax.bold.play-circle"
                    :size="24"
                    color="black"
                  />
                </button>

                <!-- Fast Forward 15s -->
                <button
                  @click="forwardAudio"
                  class="flex flex-col items-center text-white hover:text-gray-400 transition cursor-pointer"
                >
                  <div
                    class="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center mb-1 text-white"
                  >
                    <span class="text-xs font-semibold">15</span>
                  </div>
                </button>
              </div>

              <span class="text-sm text-white font-mono">{{ formatTime(audioDuration) }}</span>
            </div>
          </div>

          <!-- Hidden Audio Element -->
          <audio
            ref="audioElement"
            :src="selectedMedia.url"
            @loadedmetadata="onAudioLoaded"
            @timeupdate="onAudioTimeUpdate"
            @play="onAudioPlay"
            @pause="onAudioPause"
            @ended="onAudioEnded"
          />
        </div>
      </div>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import { useGallery } from '@/composables/useGallery'
import { ref, watch, onUnmounted, computed } from 'vue'
import type { AttachmentInterface } from '@/types/vault.types'

const { getMediaType } = useGallery()

const props = defineProps<{
  selectedMedia: AttachmentInterface | null
  showPreviewModal: boolean
  mediaList?: AttachmentInterface[] // Optional: if provided, enables navigation
}>()

const emit = defineEmits<{
  (e: 'update:showPreviewModal', value: boolean): void
  (e: 'update:selectedMedia', media: AttachmentInterface | null): void
  (e: 'close'): void
}>()

// Computed for v-model binding
const localShowPreviewModal = computed({
  get: () => props.showPreviewModal,
  set: (value: boolean) => emit('update:showPreviewModal', value),
})

// Computed for navigation
const currentMediaIndex = computed(() => {
  if (!props.selectedMedia || !props.mediaList) return -1
  return props.mediaList.findIndex((item) => item.id === props.selectedMedia?.id)
})

const canNavigatePrevious = computed(() => {
  return props.mediaList ? currentMediaIndex.value > 0 : false
})

const canNavigateNext = computed(() => {
  return props.mediaList
    ? currentMediaIndex.value >= 0 && currentMediaIndex.value < props.mediaList.length - 1
    : false
})

// Navigation functions
const navigatePrevious = () => {
  if (canNavigatePrevious.value && props.mediaList) {
    const prevIndex = currentMediaIndex.value - 1
    const prevMedia = props.mediaList[prevIndex]
    if (prevMedia) {
      emit('update:selectedMedia', prevMedia)
    }
  }
}

const navigateNext = () => {
  if (canNavigateNext.value && props.mediaList) {
    const nextIndex = currentMediaIndex.value + 1
    const nextMedia = props.mediaList[nextIndex]
    if (nextMedia) {
      emit('update:selectedMedia', nextMedia)
    }
  }
}

// Download function
const downloadMedia = () => {
  if (!props.selectedMedia) return

  const link = document.createElement('a')
  link.href = props.selectedMedia.url
  link.download = props.selectedMedia.name || `media-${props.selectedMedia.id}`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Close handler
const handleClose = () => {
  localShowPreviewModal.value = false
  emit('close')
}

// Video refs and state
const videoElement = ref<HTMLVideoElement | null>(null)
const isVideoPlaying = ref(false)
const videoCurrentTime = ref(0)
const videoDuration = ref(0)

// Audio refs and state
const audioElement = ref<HTMLAudioElement | null>(null)
const isAudioPlaying = ref(false)
const audioCurrentTime = ref(0)
const audioDuration = ref(0)

// Watch for media changes to reset state
watch(
  () => props.selectedMedia,
  () => {
    if (props.selectedMedia && getMediaType(props.selectedMedia.mime_type) === 'video') {
      resetVideoState()
    } else if (props.selectedMedia && getMediaType(props.selectedMedia.mime_type) === 'audio') {
      resetAudioState()
    }
  },
)

// Video functions
const onVideoLoaded = () => {
  if (videoElement.value) {
    videoDuration.value = videoElement.value.duration || 0
  }
}

const onVideoTimeUpdate = () => {
  if (videoElement.value) {
    videoCurrentTime.value = videoElement.value.currentTime
  }
}

const onVideoPlay = () => {
  isVideoPlaying.value = true
}

const onVideoPause = () => {
  isVideoPlaying.value = false
}

const toggleVideoPlay = async () => {
  if (!videoElement.value) return
  try {
    if (isVideoPlaying.value) {
      videoElement.value.pause()
    } else {
      await videoElement.value.play()
    }
  } catch (error) {
    console.error('Error toggling video playback:', error)
  }
}

const handleVideoTimeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseFloat(target.value)
  videoCurrentTime.value = value
  if (videoElement.value) {
    videoElement.value.currentTime = value
  }
}

const rewindVideo = () => {
  if (!videoElement.value) return
  videoElement.value.currentTime = Math.max(0, videoElement.value.currentTime - 15)
}

const forwardVideo = () => {
  if (!videoElement.value) return
  videoElement.value.currentTime = Math.min(
    videoDuration.value,
    videoElement.value.currentTime + 15,
  )
}

const resetVideoState = () => {
  if (videoElement.value) {
    videoElement.value.pause()
    videoElement.value.currentTime = 0
  }
  isVideoPlaying.value = false
  videoCurrentTime.value = 0
  videoDuration.value = 0
}

// Audio functions
const onAudioLoaded = () => {
  if (audioElement.value) {
    audioDuration.value = audioElement.value.duration || 0
  }
}

const onAudioTimeUpdate = () => {
  if (audioElement.value) {
    audioCurrentTime.value = audioElement.value.currentTime
  }
}

const onAudioPlay = () => {
  isAudioPlaying.value = true
}

const onAudioPause = () => {
  isAudioPlaying.value = false
}

const onAudioEnded = () => {
  isAudioPlaying.value = false
  audioCurrentTime.value = audioDuration.value
}

const toggleAudioPlay = async () => {
  if (!audioElement.value) return
  try {
    if (isAudioPlaying.value) {
      audioElement.value.pause()
    } else {
      await audioElement.value.play()
    }
  } catch (error) {
    console.error('Error toggling audio playback:', error)
  }
}

const handleAudioTimeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseFloat(target.value)
  audioCurrentTime.value = value
  if (audioElement.value) {
    audioElement.value.currentTime = value
  }
}

const rewindAudio = () => {
  if (!audioElement.value) return
  audioElement.value.currentTime = Math.max(0, audioElement.value.currentTime - 15)
}

const forwardAudio = () => {
  if (!audioElement.value) return
  audioElement.value.currentTime = Math.min(
    audioDuration.value,
    audioElement.value.currentTime + 15,
  )
}

const resetAudioState = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
  }
  isAudioPlaying.value = false
  audioCurrentTime.value = 0
  audioDuration.value = 0
}

// Format time helper
const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0.00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(2)
  return `${mins}.${secs.padStart(2, '0')}`
}

// Cleanup on unmount
onUnmounted(() => {
  resetVideoState()
  resetAudioState()
})
</script>

<style scoped>
:deep(.full-page-modal) {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

:deep(.download-button .n-button__content) {
  gap: 0.5rem !important;
}

:deep(.full-page-modal .n-modal__mask) {
  padding: 0 !important;
  background-color: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

:deep(.full-page-modal .n-modal__container) {
  padding: 0 !important;
}

:deep(.full-page-modal .n-card) {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  border-radius: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  margin: 0 !important;
  background-color: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  box-shadow: none !important;
}

:deep(.full-page-modal .n-card__header) {
  background-color: transparent !important;
  border-bottom: none !important;
  padding: 1rem !important;
}

:deep(.full-page-modal .n-card__content) {
  flex: 1 !important;
  overflow: auto !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  background-color: transparent !important;
}

.media-preview-modal {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid #6b7280;
}

input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid #6b7280;
}
</style>
