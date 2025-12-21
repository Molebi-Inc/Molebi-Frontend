<template>
  <div class="gallery-component relative">
    <!-- Batch Action Bar -->
    <div
      v-if="allowBatchAction && selectedMediaIds.size > 0"
      class="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-200 flex items-center justify-between"
    >
      <div class="flex items-center gap-4">
        <span class="text-xs md:text-sm font-medium text-gray-700">
          {{ selectedMediaIds.size }} {{ selectedMediaIds.size === 1 ? 'item' : 'items' }} selected
        </span>
        <MlbButton
          @click="clearSelection"
          text
          class="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer :hover:text-underline!"
        >
          <MlbIcon name="vuesax.linear.close-circle" :size="18" color="#374151" />
          {{ isLargeScreen ? 'Clear selection' : '' }}
        </MlbButton>
      </div>
      <div class="flex items-center gap-3">
        <MlbButton
          @click="handleBatchDownload"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <MlbIcon name="vuesax.broken.document-download" :size="18" color="#374151" />
          {{ isLargeScreen ? 'Download' : '' }}
        </MlbButton>
        <MlbButton
          @click="handleBatchDelete"
          class="flex items-center gap-2 px-4 py-2 bg-red-50! border border-red-200! rounded-lg hover:bg-red-100! transition-colors text-sm font-medium text-red-700!"
        >
          <MlbIcon name="delete" :size="18" color="#C20000" />
          {{ isLargeScreen ? 'Delete' : '' }}
        </MlbButton>
      </div>
    </div>

    <div v-if="isLoading">
      <SkeletalLoader :rows="2" :columns="isLargeScreen ? itemsPerRow : 2" height="174px" />
    </div>
    <div v-else>
      <!-- Grid Layout -->
      <div v-if="layout === 'grid'" :class="['grid gap-4', getGridColsClass]">
        <div
          v-for="item in filteredMedia"
          :key="item.id"
          class="relative group cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow active:scale-95"
          :class="{ 'ring-2 ring-primary-500': allowBatchAction && isSelected(item.id) }"
          @click="allowBatchAction ? handleItemClick(item, $event) : openMediaPreview(item)"
        >
          <!-- Selection Checkbox -->
          <div
            v-if="allowBatchAction"
            class="selection-checkbox absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            :class="{ 'opacity-100': isSelected(item.id) }"
            @click.stop="toggleSelection(item.id)"
          >
            <div
              class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
              :class="
                isSelected(item.id)
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-white border-gray-300 hover:border-primary-400'
              "
            >
              <MlbIcon
                v-if="isSelected(item.id)"
                name="vuesax.linear.tick-circle"
                :size="18"
                color="white"
              />
            </div>
          </div>
          <!-- Image Thumbnail -->
          <div
            v-if="getMediaType(item.mime_type) === 'image'"
            class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden"
          >
            <img
              :src="item.thumbnail || item.url"
              :alt="item.name || 'Image'"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center"
            >
              <MlbIcon
                name="vuesax.linear.eye"
                :size="32"
                color="white"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <!-- Video Thumbnail -->
          <div
            v-else-if="getMediaType(item.mime_type) === 'video'"
            class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative"
          >
            <img
              v-if="getVideoThumbnail(item)"
              :src="getVideoThumbnail(item)"
              :alt="item.name || 'Video'"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="handleThumbnailError(item)"
            />
            <div
              v-else-if="!isGeneratingThumbnail(item.id)"
              class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
            >
              <MlbIcon name="vuesax.linear.video" :size="48" color="#6B7280" />
            </div>
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
            >
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
            <div
              class="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity flex items-center justify-center"
            >
              <div
                class="w-16 h-16 bg-white opacity-90 rounded-full flex items-center justify-center group-hover:opacity-100 transition-opacity"
              >
                <MlbIcon name="vuesax.linear.play" :size="24" color="#02BF83" />
              </div>
            </div>
          </div>

          <!-- Audio Thumbnail -->
          <div
            v-else-if="getMediaType(item.mime_type) === 'audio'"
            class="aspect-square bg-gray-50 flex items-center justify-center"
          >
            <img
              src="@/assets/images/audio-thumbnail.png"
              alt="Audio"
              class="w-48 h-48 object-contain"
            />
            <!-- <div class="text-center">
              <MlbIcon name="vuesax.linear.music" :size="48" color="#02BF83" />
            </div> -->
            <div
              class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center"
            >
              <MlbIcon
                name="vuesax.linear.play"
                :size="32"
                color="white"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <!-- Media Info -->
          <div v-if="showInfo" class="p-3">
            <h4 class="text-sm font-medium text-gray-900 truncate mb-1">
              {{ item.name || 'Untitled' }}
            </h4>
            <p v-if="item.date" class="text-xs text-gray-500 truncate">
              {{ formatDate(item.date) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Horizontal Scroll Layout -->
      <div
        v-else-if="layout === 'horizontal'"
        class="overflow-x-auto scrollbar-hide"
        :style="{ scrollbarWidth: 'none', msOverflowStyle: 'none' }"
      >
        <div class="flex gap-4 pb-2" :style="{ minWidth: 'max-content' }">
          <div
            v-for="item in filteredMedia"
            :key="item.id"
            class="relative group cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow shrink-0"
            :style="{ width: `${itemSize}px` }"
            :class="{ 'ring-2 ring-primary-500': allowBatchAction && isSelected(item.id) }"
            @click="allowBatchAction ? handleItemClick(item, $event) : openMediaPreview(item)"
          >
            <!-- Selection Checkbox -->
            <div
              v-if="allowBatchAction"
              class="selection-checkbox absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              :class="{ 'opacity-100': isSelected(item.id) }"
              @click.stop="toggleSelection(item.id)"
            >
              <div
                class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                :class="
                  isSelected(item.id)
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300 hover:border-primary-400'
                "
              >
                <MlbIcon
                  v-if="isSelected(item.id)"
                  name="vuesax.linear.tick-circle"
                  :size="18"
                  color="white"
                />
              </div>
            </div>
            <!-- Image Thumbnail -->
            <div
              v-if="getMediaType(item.mime_type) === 'image'"
              class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden"
            >
              <img
                :src="item.thumbnail || item.url"
                :alt="item.name || 'Image'"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center"
              >
                <MlbIcon
                  name="vuesax.linear.eye"
                  :size="32"
                  color="white"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <!-- Video Thumbnail -->
            <div
              v-else-if="getMediaType(item.mime_type) === 'video'"
              class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative"
            >
              <img
                v-if="getVideoThumbnail(item)"
                :src="getVideoThumbnail(item)"
                :alt="item.name || 'Video'"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="handleThumbnailError(item)"
              />
              <div
                v-else-if="!isGeneratingThumbnail(item.id)"
                class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
              >
                <MlbIcon name="vuesax.linear.video" :size="48" color="#6B7280" />
              </div>
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
              >
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              </div>
              <div
                class="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity flex items-center justify-center"
              >
                <div
                  class="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MlbIcon name="vuesax.linear.play" :size="24" color="#02BF83" />
                </div>
              </div>
            </div>

            <!-- Audio Thumbnail -->
            <div
              v-else-if="getMediaType(item.mime_type) === 'audio'"
              class="aspect-square bg-gray-50 flex items-center justify-center"
            >
              <img
                src="@/assets/images/audio-thumbnail.png"
                alt="Audio"
                class="w-48 h-48 object-contain"
              />
              <!-- <div class="text-center">
                <MlbIcon name="vuesax.linear.music" :size="48" color="#02BF83" />
              </div> -->
              <div
                class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center"
              >
                <MlbIcon
                  name="vuesax.linear.play"
                  :size="32"
                  color="white"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <!-- Media Info -->
            <div v-if="showInfo" class="p-3">
              <h4 class="text-sm font-medium text-gray-900 truncate mb-1">
                {{ item.name || 'Untitled' }}
              </h4>
              <p v-if="item.date" class="text-xs text-gray-500 truncate">
                {{ formatDate(item.date) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Preview Modal -->
    <MediaPreviewModal
      v-model:show-preview-modal="showPreviewModal"
      v-model:selected-media="selectedMedia"
      :media-list="filteredMedia"
      @close="closePreview"
      @update:show-preview-modal="closePreview"
    />

    <!-- Create Button Slot (positioned at bottom) -->
    <div class="absolute bottom-10 right-10 z-20">
      <slot name="create-button" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { useGallery } from '@/composables/useGallery'
import type { AttachmentInterface } from '@/types/vault.types'
import MediaPreviewModal from '@/components/common/MediaPreviewModal.vue'
import SkeletalLoader from '@/components/common/SkeletalLoader.vue'
import { useMediaQuery } from '@vueuse/core'
import MlbButton from '@/components/ui/MlbButton.vue'
import { downloadFile } from '@/helpers/general.helpers'

// Props
interface Props {
  // media: MediaItem[]
  media: AttachmentInterface[]
  itemsPerRow?: number
  mediaType?: 'image' | 'video' | 'audio' | 'all'
  layout?: 'grid' | 'horizontal'
  itemSize?: number // For horizontal layout
  showInfo?: boolean // Show title and date below thumbnail
  allowBatchAction?: boolean // Enable batch selection and actions
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerRow: 4,
  mediaType: 'all',
  layout: 'grid',
  itemSize: 200,
  showInfo: true,
  allowBatchAction: false,
  isLoading: false,
})

const isLargeScreen = useMediaQuery('(min-width: 768px)')
const { getMediaType } = useGallery()

// Emits
const emit = defineEmits<{
  (e: 'batch-download', mediaIds: number[]): void
  (e: 'batch-delete', mediaIds: number[]): void
}>()

// State
const showPreviewModal = ref(false)
const selectedMedia = ref<AttachmentInterface | null>(null)
const selectedMediaIds = ref<Set<string | number>>(new Set())
const videoThumbnails = ref<Map<string | number, string>>(new Map())
const generatingThumbnails = ref<Set<string | number>>(new Set())
const thumbnailErrors = ref<Set<string | number>>(new Set())

// Computed
const filteredMedia = computed(() => {
  if (props.mediaType === 'all') {
    return props.media
  }
  return props.media.filter((item) => getMediaType(item.mime_type) === props.mediaType)
})

const getGridColsClass = computed(() => {
  const cols = props.itemsPerRow
  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }
  return colClasses[cols] || `grid-cols-${cols}`
})

// Methods
const openMediaPreview = (item: AttachmentInterface) => {
  selectedMedia.value = item
  showPreviewModal.value = true
}

const handleItemClick = (item: AttachmentInterface, event: MouseEvent) => {
  // Only open preview if checkbox wasn't clicked
  const target = event.target as HTMLElement
  if (!target.closest('.selection-checkbox')) {
    openMediaPreview(item)
  }
}

const isSelected = (id: string | number): boolean => {
  return selectedMediaIds.value.has(id)
}

const toggleSelection = (id: string | number) => {
  if (selectedMediaIds.value.has(id)) {
    selectedMediaIds.value.delete(id)
  } else {
    selectedMediaIds.value.add(id)
  }
}

const clearSelection = () => {
  selectedMediaIds.value.clear()
}

const handleBatchDownload = () => {
  const ids = Array.from(selectedMediaIds.value)
  for (const id of ids) {
    const item = filteredMedia.value.find((item) => item.id === id)
    if (item) {
      downloadFile(item.url)
    }
  }
  emit('batch-download', ids as number[])
  clearSelection()
}

const handleBatchDelete = () => {
  const ids = Array.from(selectedMediaIds.value)
  emit('batch-delete', ids as number[])
  clearSelection()
}

const closePreview = () => {
  showPreviewModal.value = false
  // Reset media player when closing
  selectedMedia.value = null as unknown as AttachmentInterface
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Video thumbnail generation
const generateVideoThumbnail = async (item: AttachmentInterface): Promise<string | null> => {
  if (thumbnailErrors.value.has(item.id)) {
    return null
  }

  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      resolve(null)
      return
    }

    const handleLoadedMetadata = () => {
      // Seek to 1 second or 10% of video duration, whichever is smaller
      const seekTime = Math.min(1, video.duration * 0.1)
      video.currentTime = seekTime
    }

    const handleSeeked = () => {
      try {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        videoThumbnails.value.set(item.id, thumbnailUrl)
        generatingThumbnails.value.delete(item.id)
        resolve(thumbnailUrl)
      } catch (error) {
        console.error('Error generating thumbnail:', error)
        thumbnailErrors.value.add(item.id)
        generatingThumbnails.value.delete(item.id)
        resolve(null)
      } finally {
        video.remove()
        canvas.remove()
      }
    }

    const handleError = () => {
      console.error('Error loading video for thumbnail:', item.url)
      thumbnailErrors.value.add(item.id)
      generatingThumbnails.value.delete(item.id)
      video.remove()
      canvas.remove()
      resolve(null)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
    video.addEventListener('seeked', handleSeeked, { once: true })
    video.addEventListener('error', handleError, { once: true })

    video.src = item.url
    video.load()
  })
}

const getVideoThumbnail = (item: AttachmentInterface): string | undefined => {
  // Return generated thumbnail if available
  return videoThumbnails.value.get(item.id)
}

const isGeneratingThumbnail = (id: string | number): boolean => {
  return generatingThumbnails.value.has(id)
}

const handleThumbnailError = (item: AttachmentInterface) => {
  // If thumbnail fails to load, try generating one
  if (!videoThumbnails.value.has(item.id) && !generatingThumbnails.value.has(item.id)) {
    generatingThumbnails.value.add(item.id)
    generateVideoThumbnail(item)
  }
}

// Generate thumbnails for videos without thumbnails
const generateMissingThumbnails = async () => {
  const videosWithoutThumbnails = filteredMedia.value.filter(
    (item) =>
      getMediaType(item.mime_type) === 'video' &&
      !videoThumbnails.value.has(item.id) &&
      !generatingThumbnails.value.has(item.id) &&
      !thumbnailErrors.value.has(item.id),
  )

  for (const video of videosWithoutThumbnails) {
    generatingThumbnails.value.add(video.id)
    generateVideoThumbnail(video)
  }
}

// Watch for changes in filtered media and generate thumbnails
watch(
  () => filteredMedia.value,
  () => {
    generateMissingThumbnails()
  },
  { immediate: true },
)

// Generate thumbnails on mount
onMounted(() => {
  generateMissingThumbnails()
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
