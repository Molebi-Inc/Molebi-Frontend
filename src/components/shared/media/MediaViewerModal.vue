<template>
  <Teleport to="body">
    <Transition name="viewer">
      <div v-if="show" ref="overlayRef" class="fixed inset-0 z-50 flex flex-col bg-black/95 outline-none" @keydown.esc="$emit('update:show', false)" @keydown.arrow-left="prev" @keydown.arrow-right="next" tabindex="-1">

        <!-- ── Top bar ────────────────────────────────────────────────────── -->
        <div class="flex items-center justify-between px-4 py-3 z-10 flex-shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <button class="text-white/70 hover:text-white transition-colors flex-shrink-0" @click="$emit('update:show', false)">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 3L17 17M17 3L3 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
            <span class="text-white/80 text-sm truncate max-w-[240px]">{{ currentItem?.file_name }}</span>
          </div>
          <a
            v-if="currentItem?.url"
            :href="currentItem.url"
            download
            class="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V10M5 7L8 10L11 7M2 13H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Download
          </a>
        </div>

        <!-- ── Desktop layout ─────────────────────────────────────────────── -->
        <div class="hidden md:flex flex-1 relative overflow-hidden">

          <!-- Blurred grid background -->
          <div class="absolute inset-0 grid grid-cols-6 gap-1 opacity-20 blur-sm pointer-events-none">
            <div v-for="item in items" :key="item.id" class="aspect-square overflow-hidden">
              <img v-if="isVisual(item)" :src="item.thumbnail || item.url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-neutral-700" />
            </div>
          </div>
          <div class="absolute inset-0 bg-black/60" />

          <!-- Left nav arrow -->
          <button
            v-if="currentIndex > 0"
            class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            @click="prev"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 13.5L6.5 9L11 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <!-- Right nav arrow -->
          <button
            v-if="currentIndex < items.length - 1"
            class="absolute right-[320px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            @click="next"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 4.5L11.5 9L7 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <!-- Main media area -->
          <div class="flex-1 flex items-center justify-center relative z-10 overflow-hidden" style="margin-right: 300px">
            <!-- Image -->
            <img
              v-if="currentItem && isImage(currentItem)"
              :src="currentItem.url"
              :alt="currentItem.file_name"
              class="max-h-full max-w-full object-contain"
            />

            <!-- Video -->
            <div v-else-if="currentItem && isVideo(currentItem)" class="relative w-full max-h-full flex items-center justify-center">
              <video
                ref="videoEl"
                :src="currentItem.url"
                class="max-h-[calc(100vh-200px)] max-w-full"
                @timeupdate="onVideoTimeUpdate"
                @loadedmetadata="onVideoLoaded"
                @ended="videoPlaying = false"
              />
              <!-- Video overlay controls -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-white/80 text-xs">{{ formatTime(videoTime) }}</span>
                  <input v-model.number="videoSeek" type="range" min="0" :max="videoDuration || 100" step="0.1" class="flex-1 h-1 accent-white" @input="onVideoSeek" />
                  <span class="text-white/80 text-xs">{{ formatTime(videoDuration) }}</span>
                </div>
                <div class="flex items-center justify-center gap-4">
                  <button class="text-white/70 hover:text-white transition-colors" @click="skipVideo(-10)">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10C4 6.7 6.7 4 10 4C12 4 13.8 5 15 6.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5 9L4 10L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><text x="8" y="16" font-size="5" fill="currentColor" font-weight="bold">10</text></svg>
                  </button>
                  <button class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" @click="toggleVideo">
                    <svg v-if="!videoPlaying" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 2L14 8L4 14V2Z" fill="white" />
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="2" width="3" height="12" rx="1" fill="white" />
                      <rect x="10" y="2" width="3" height="12" rx="1" fill="white" />
                    </svg>
                  </button>
                  <button class="text-white/70 hover:text-white transition-colors" @click="skipVideo(10)">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16 10C16 6.7 13.3 4 10 4C8 4 6.2 5 5 6.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M15 9L16 10L17 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><text x="8" y="16" font-size="5" fill="currentColor" font-weight="bold">10</text></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Audio -->
            <div v-else-if="currentItem && isAudio(currentItem)" class="flex flex-col items-center justify-center gap-6 w-full max-w-lg px-8">
              <div class="w-full aspect-video bg-neutral-800 rounded-2xl flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <path d="M24 18V62M24 18L56 12V56M24 62C24 66.4 20.4 70 16 70C11.6 70 8 66.4 8 62C8 57.6 11.6 54 16 54C20.4 54 24 57.6 24 62ZM56 56C56 60.4 52.4 64 48 64C43.6 64 40 60.4 40 56C40 51.6 43.6 48 48 48C52.4 48 56 51.6 56 56Z"
                    stroke="white" stroke-opacity="0.6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <AudioPreviewPlayer v-if="currentItem.url" :audio-url="currentItem.url" class="w-full" />
            </div>
          </div>

          <!-- Info card (right panel) -->
          <div class="absolute right-0 top-0 bottom-0 w-[300px] z-10 p-3 flex flex-col">
            <MemoryInfoCard
              :title="albumName || 'Memory'"
              :description="description"
              :comments="comments"
              class="flex-1"
              @comment="onComment"
              @share="$emit('share')"
            />
          </div>
        </div>

        <!-- ── Mobile layout ──────────────────────────────────────────────── -->
        <div class="md:hidden flex-1 flex flex-col overflow-y-auto">

          <!-- Media area -->
          <div class="relative flex-shrink-0" style="min-height: 260px">
            <!-- Blurred bg -->
            <div class="absolute inset-0 grid grid-cols-4 gap-0.5 opacity-30 blur-[2px] pointer-events-none">
              <div v-for="item in items" :key="item.id" class="aspect-square overflow-hidden">
                <img v-if="isVisual(item)" :src="item.thumbnail || item.url" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-neutral-700" />
              </div>
            </div>
            <div class="absolute inset-0 bg-black/50" />

            <!-- Nav arrows -->
            <button v-if="currentIndex > 0" class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center" @click="prev">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="white" stroke-width="1.5" stroke-linecap="round" /></svg>
            </button>
            <button v-if="currentIndex < items.length - 1" class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center" @click="next">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="white" stroke-width="1.5" stroke-linecap="round" /></svg>
            </button>

            <!-- Image -->
            <img v-if="currentItem && isImage(currentItem)" :src="currentItem.url" :alt="currentItem.file_name" class="relative z-10 w-full max-h-[300px] object-contain" />

            <!-- Video -->
            <div v-else-if="currentItem && isVideo(currentItem)" class="relative z-10">
              <video ref="mobileVideoEl" :src="currentItem.url" class="w-full max-h-[300px] object-contain" @timeupdate="onVideoTimeUpdate" @loadedmetadata="onVideoLoaded" @ended="videoPlaying = false" />
              <div class="px-4 py-2 bg-black/60">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-white/70 text-[11px]">{{ formatTime(videoTime) }}</span>
                  <input v-model.number="videoSeek" type="range" min="0" :max="videoDuration || 100" step="0.1" class="flex-1 h-0.5 accent-white" @input="onVideoSeek" />
                  <span class="text-white/70 text-[11px]">{{ formatTime(videoDuration) }}</span>
                </div>
                <div class="flex items-center justify-center gap-5">
                  <button class="text-white/70" @click="skipVideo(-10)"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3"/><text x="4" y="13" font-size="6" fill="currentColor">10</text></svg></button>
                  <button class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center" @click="toggleVideo">
                    <svg v-if="!videoPlaying" width="14" height="14" viewBox="0 0 14 14"><path d="M3 1.5L13 7L3 12.5V1.5Z" fill="white"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1.5" width="3" height="11" rx="1" fill="white"/><rect x="9" y="1.5" width="3" height="11" rx="1" fill="white"/></svg>
                  </button>
                  <button class="text-white/70" @click="skipVideo(10)"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3"/><text x="4" y="13" font-size="6" fill="currentColor">10</text></svg></button>
                </div>
              </div>
            </div>

            <!-- Audio -->
            <div v-else-if="currentItem && isAudio(currentItem)" class="relative z-10 flex flex-col items-center py-6 gap-4">
              <div class="w-full max-w-[200px] aspect-square bg-neutral-700/80 rounded-2xl flex items-center justify-center mx-auto">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><path d="M16 12V44M16 12L40 8V40M16 44C16 46.2 14.2 48 12 48C9.8 48 8 46.2 8 44C8 41.8 9.8 40 12 40C14.2 40 16 41.8 16 44ZM40 40C40 42.2 38.2 44 36 44C33.8 44 32 42.2 32 40C32 37.8 33.8 36 36 36C38.2 36 40 37.8 40 40Z" stroke="white" stroke-opacity="0.7" stroke-width="2.5" stroke-linecap="round" /></svg>
              </div>
              <div class="w-full px-4">
                <AudioPreviewPlayer v-if="currentItem.url" :audio-url="currentItem.url" />
              </div>
            </div>
          </div>

          <!-- Info card (below media on mobile) -->
          <div class="bg-white flex-1 px-4 pt-4 pb-24">
            <MemoryInfoCard
              :title="albumName || 'Memory'"
              :description="description"
              :comments="comments"
              class="h-auto shadow-none!"
              @comment="onComment"
              @share="$emit('share')"
            />
          </div>
        </div>

        <!-- ── Desktop thumbnail strip ────────────────────────────────────── -->
        <div class="hidden md:flex items-center gap-2 px-4 py-2 flex-shrink-0 overflow-x-auto">
          <button
            v-for="(item, i) in items"
            :key="item.id"
            class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2"
            :class="i === currentIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'"
            @click="currentIndex = i"
          >
            <img v-if="isVisual(item)" :src="item.thumbnail || item.url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-neutral-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 4V14M6 4L13 2.5V12.5M6 14C6 15.1 5.1 16 4 16C2.9 16 2 15.1 2 14C2 12.9 2.9 12 4 12C5.1 12 6 12.9 6 14ZM13 12.5C13 13.6 12.1 14.5 11 14.5C9.9 14.5 9 13.6 9 12.5C9 11.4 9.9 10.5 11 10.5C12.1 10.5 13 11.4 13 12.5Z" stroke="white" stroke-width="1.3" stroke-linecap="round" /></svg>
            </div>
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { AttachmentInterface } from '@/types/vault.types'
import MemoryInfoCard from './MemoryInfoCard.vue'
import AudioPreviewPlayer from './AudioPreviewPlayer.vue'
import type { MemoryComment } from './MemoryInfoCard.vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    items: AttachmentInterface[]
    initialIndex?: number
    albumName?: string
    description?: string
    comments?: MemoryComment[]
  }>(),
  { initialIndex: 0, comments: () => [] },
)

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'share'): void
  (e: 'comment', text: string): void
}>()

const overlayRef = ref<HTMLDivElement | null>(null)
const currentIndex = ref(props.initialIndex)
const currentItem = computed(() => props.items[currentIndex.value] ?? null)

// Video state
const videoEl = ref<HTMLVideoElement | null>(null)
const mobileVideoEl = ref<HTMLVideoElement | null>(null)
const videoPlaying = ref(false)
const videoTime = ref(0)
const videoDuration = ref(0)
const videoSeek = ref(0)

const activeVideo = computed(() => videoEl.value || mobileVideoEl.value)

// Media type helpers
const isImage = (item: AttachmentInterface) => item.mime_type?.startsWith('image/')
const isVideo = (item: AttachmentInterface) => item.mime_type?.startsWith('video/')
const isAudio = (item: AttachmentInterface) => item.mime_type?.startsWith('audio/')
const isVisual = (item: AttachmentInterface) => isImage(item) || isVideo(item)

const prev = () => { if (currentIndex.value > 0) currentIndex.value-- }
const next = () => { if (currentIndex.value < props.items.length - 1) currentIndex.value++ }

// Video controls
const toggleVideo = () => {
  if (!activeVideo.value) return
  if (videoPlaying.value) { activeVideo.value.pause(); videoPlaying.value = false }
  else { activeVideo.value.play(); videoPlaying.value = true }
}
const skipVideo = (sec: number) => {
  if (activeVideo.value) activeVideo.value.currentTime = Math.max(0, Math.min(videoDuration.value, activeVideo.value.currentTime + sec))
}
const onVideoTimeUpdate = () => {
  videoTime.value = activeVideo.value?.currentTime ?? 0
  videoSeek.value = videoTime.value
}
const onVideoLoaded = () => { videoDuration.value = activeVideo.value?.duration ?? 0 }
const onVideoSeek = () => { if (activeVideo.value) activeVideo.value.currentTime = videoSeek.value }

const formatTime = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const onComment = (text: string) => emit('comment', text)

// Reset video state when item changes
watch(currentIndex, () => {
  videoPlaying.value = false
  videoTime.value = 0
  videoDuration.value = 0
  videoSeek.value = 0
})

// Sync initialIndex when show toggles on
watch(() => props.show, (val) => {
  if (val) {
    currentIndex.value = props.initialIndex
    nextTick(() => overlayRef.value?.focus())
  }
})
</script>

<style scoped>
.viewer-enter-active,
.viewer-leave-active {
  transition: opacity 0.2s ease;
}
.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}
</style>
