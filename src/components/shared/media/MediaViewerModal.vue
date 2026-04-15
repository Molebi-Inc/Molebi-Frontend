<template>
  <Teleport to="body">
    <Transition name="viewer">
      <div v-if="show" ref="overlayRef"
        class="fixed inset-0 z-50 flex flex-col bg-transparent outline-none relative overscroll-contain"
        @keydown.esc="$emit('update:show', false)" @keydown.arrow-left="prev" @keydown.arrow-right="next" tabindex="-1">

        <!-- Backdrop overlay (tap to close) -->
        <button type="button" class="absolute inset-0 bg-black/25" aria-label="Close"
          @click="$emit('update:show', false)" />

        <!-- ── Top bar ────────────────────────────────────────────────────── -->
        <div class="flex items-center justify-between px-4 py-3 z-10 flex-shrink-0 bg-black/30" @click.stop>
          <!-- Left: close (X) + filename -->
          <div class="flex items-center gap-3 min-w-0">
            <button type="button" class="text-white/80 hover:text-white transition-colors flex-shrink-0"
              @click="$emit('update:show', false)">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
            <span class="text-white/90 text-sm truncate block max-w-[220px]">
              {{ currentItem?.file_name }}
            </span>
          </div>

          <!-- Right: download + 3-dots -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <a v-if="currentItem?.url" :href="currentItem.url" download
              class="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V10M5 7L8 10L11 7M2 13H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              Download
            </a>
            <button class="text-white/70 hover:text-white transition-colors" type="button">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="4.5" cy="9" r="1.25" fill="currentColor" />
                <circle cx="9" cy="9" r="1.25" fill="currentColor" />
                <circle cx="13.5" cy="9" r="1.25" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <!-- ── Desktop layout ─────────────────────────────────────────────── -->
        <div class="hidden md:flex flex-1 items-center justify-center relative" @click.stop>
          <!-- Constrained desktop card so it’s not “too big” -->
          <div
            class="relative z-10 w-[92vw] max-w-[1120px] h-[80vh] rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">

            <!-- Left nav arrow -->
            <button v-if="currentIndex > 0"
              class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              @click="prev">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 13.5L6.5 9L11 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>

            <!-- Right nav arrow -->
            <button v-if="currentIndex < items.length - 1"
              class="absolute right-[320px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              @click="next">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 4.5L11.5 9L7 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>

            <!-- Main media area -->
            <div class="flex-1 flex items-center justify-center relative z-10 overflow-hidden"
              style="margin-right: 300px">
              <!-- Image -->
              <img v-if="currentItem && isImage(currentItem)" :src="currentItem.url" :alt="currentItem.file_name"
                class="max-h-full max-w-full object-contain" />

              <!-- Video -->
              <div v-else-if="currentItem && isVideo(currentItem)"
                class="relative w-full max-h-full flex items-center justify-center">
                <video ref="videoEl" :src="currentItem.url" class="max-h-[calc(100vh-200px)] max-w-full"
                  @timeupdate="onVideoTimeUpdate" @loadedmetadata="onVideoLoaded" @ended="videoPlaying = false" />
                <!-- Video overlay controls -->
                <div
                  class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-white/80 text-xs">{{ formatTime(videoTime) }}</span>
                    <input v-model.number="videoSeek" type="range" min="0" :max="videoDuration || 100" step="0.1"
                      class="flex-1 h-1 accent-white" @input="onVideoSeek" />
                    <span class="text-white/80 text-xs">{{ formatTime(videoDuration) }}</span>
                  </div>
                  <div class="flex items-center justify-center gap-4">
                    <button class="text-white/70 hover:text-white transition-colors" @click="skipVideo(-10)">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10C4 6.7 6.7 4 10 4C12 4 13.8 5 15 6.6" stroke="currentColor" stroke-width="1.5"
                          stroke-linecap="round" />
                        <path d="M5 9L4 10L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round" /><text x="8" y="16" font-size="5" fill="currentColor"
                          font-weight="bold">10</text>
                      </svg>
                    </button>
                    <button
                      class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      @click="toggleVideo">
                      <svg v-if="!videoPlaying" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2L14 8L4 14V2Z" fill="white" />
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="2" width="3" height="12" rx="1" fill="white" />
                        <rect x="10" y="2" width="3" height="12" rx="1" fill="white" />
                      </svg>
                    </button>
                    <button class="text-white/70 hover:text-white transition-colors" @click="skipVideo(10)">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16 10C16 6.7 13.3 4 10 4C8 4 6.2 5 5 6.6" stroke="currentColor" stroke-width="1.5"
                          stroke-linecap="round" />
                        <path d="M15 9L16 10L17 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round" /><text x="8" y="16" font-size="5" fill="currentColor"
                          font-weight="bold">10</text>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Audio -->
              <div v-else-if="currentItem && isAudio(currentItem)"
                class="flex flex-col items-center justify-center gap-6 w-full max-w-lg px-8">
                <div class="w-full aspect-video bg-[#5e5f5f] rounded-2xl flex items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <path
                      d="M24 18V62M24 18L56 12V56M24 62C24 66.4 20.4 70 16 70C11.6 70 8 66.4 8 62C8 57.6 11.6 54 16 54C20.4 54 24 57.6 24 62ZM56 56C56 60.4 52.4 64 48 64C43.6 64 40 60.4 40 56C40 51.6 43.6 48 48 48C52.4 48 56 51.6 56 56Z"
                      stroke="white" stroke-opacity="0.6" stroke-width="3" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
                <AudioPreviewPlayer v-if="currentItem.url" :audio-url="currentItem.url" class="w-full" />
              </div>
            </div>

            <!-- Info card (right panel) -->
            <div class="absolute right-0 top-0 bottom-0 w-[300px] z-10 p-3 flex flex-col">
              <MemoryInfoCard :title="albumName || 'Memory'" :description="description" :comments="comments"
                class="flex-1" @comment="onComment" @share="$emit('share')" />
            </div>
          </div>
        </div>

        <!-- ── Mobile layout ──────────────────────────────────────────────── -->
        <div class="md:hidden flex-1 flex flex-col overflow-y-auto overscroll-contain" @click.stop>

          <!-- Media area -->
          <div class="relative flex-shrink-0 px-4 pt-5" style="min-height: 55vh">

            <!-- Nav arrows -->
            <button v-if="currentIndex > 0"
              class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
              @click="prev">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7L9 3" stroke="white" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
            <button v-if="currentIndex < items.length - 1"
              class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
              @click="next">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3L9 7L5 11" stroke="white" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>

            <!-- Image -->
            <img v-if="currentItem && isImage(currentItem)" :src="currentItem.url" :alt="currentItem.file_name"
              class="relative z-10 w-full max-h-[55vh] object-cover rounded-3xl shadow-2xl" />

            <!-- Video -->
            <div v-else-if="currentItem && isVideo(currentItem)" class="relative z-10">
              <video ref="mobileVideoEl" :src="currentItem.url"
                class="w-full max-h-[55vh] object-contain rounded-3xl shadow-2xl bg-black/30"
                @timeupdate="onVideoTimeUpdate" @loadedmetadata="onVideoLoaded" @ended="videoPlaying = false" />
              <div class="px-4 py-2 bg-black/60">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-white/70 text-[11px]">{{ formatTime(videoTime) }}</span>
                  <input v-model.number="videoSeek" type="range" min="0" :max="videoDuration || 100" step="0.1"
                    class="flex-1 h-0.5 accent-white" @input="onVideoSeek" />
                  <span class="text-white/70 text-[11px]">{{ formatTime(videoDuration) }}</span>
                </div>
                <div class="flex items-center justify-center gap-5">
                  <button class="text-white/70" @click="skipVideo(-10)"><svg width="18" height="18" viewBox="0 0 18 18"
                      fill="none">
                      <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3" /><text x="4" y="13"
                        font-size="6" fill="currentColor">10</text>
                    </svg></button>
                  <button class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                    @click="toggleVideo">
                    <svg v-if="!videoPlaying" width="14" height="14" viewBox="0 0 14 14">
                      <path d="M3 1.5L13 7L3 12.5V1.5Z" fill="white" />
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 14 14">
                      <rect x="2" y="1.5" width="3" height="11" rx="1" fill="white" />
                      <rect x="9" y="1.5" width="3" height="11" rx="1" fill="white" />
                    </svg>
                  </button>
                  <button class="text-white/70" @click="skipVideo(10)"><svg width="18" height="18" viewBox="0 0 18 18"
                      fill="none">
                      <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3" /><text x="4" y="13"
                        font-size="6" fill="currentColor">10</text>
                    </svg></button>
                </div>
              </div>
            </div>

            <!-- Audio -->
            <div v-else-if="currentItem && isAudio(currentItem)"
              class="relative z-10 flex flex-col items-center py-6 gap-4">
              <div
                class="w-full max-w-[200px] aspect-square bg-[#5e5f5f] rounded-2xl flex items-center justify-center mx-auto">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <path
                    d="M16 12V44M16 12L40 8V40M16 44C16 46.2 14.2 48 12 48C9.8 48 8 46.2 8 44C8 41.8 9.8 40 12 40C14.2 40 16 41.8 16 44ZM40 40C40 42.2 38.2 44 36 44C33.8 44 32 42.2 32 40C32 37.8 33.8 36 36 36C38.2 36 40 37.8 40 40Z"
                    stroke="white" stroke-opacity="0.7" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </div>
              <div class="w-full px-4">
                <AudioPreviewPlayer v-if="currentItem.url" :audio-url="currentItem.url" />
              </div>
            </div>
          </div>

          <!-- Info card + actions (matches reference screenshot) -->
          <div class="px-4 pt-4 pb-28">
            <div class="rounded-3xl bg-black/45 border border-white/10 shadow-2xl overflow-hidden">
              <div class="px-5 pt-5 pb-4">
                <h2 class="text-white text-2xl font-semibold leading-snug">
                  {{ currentItem?.title || albumName || 'Memory' }}
                </h2>
                <div class="mt-3 flex items-center gap-4 text-white/75 text-xs">
                  <div v-if="currentItem?.event_date" class="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M6 2V4M14 2V4M3 7H17M5 4H15C16.1 4 17 4.9 17 6V16C17 17.1 16.1 18 15 18H5C3.9 18 3 17.1 3 16V6C3 4.9 3.9 4 5 4Z"
                        stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    </svg>
                    <span>{{ currentItem.event_date }}</span>
                  </div>
                  <div v-if="currentItem?.metadata?.location" class="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M9 1.5C6.1 1.5 3.75 3.85 3.75 6.75C3.75 10.5 9 16.5 9 16.5C9 16.5 14.25 10.5 14.25 6.75C14.25 3.85 11.9 1.5 9 1.5ZM9 8.625C7.97 8.625 7.125 7.78 7.125 6.75C7.125 5.72 7.97 4.875 9 4.875C10.03 4.875 10.875 5.72 10.875 6.75C10.875 7.78 10.03 8.625 9 8.625Z"
                        fill="currentColor" />
                    </svg>
                    <span class="truncate max-w-[220px]">{{ currentItem.metadata.location }}</span>
                  </div>
                </div>
                <p v-if="currentItem?.description || description" class="text-white/75 text-sm mt-2 leading-relaxed">
                  {{ currentItem?.description || description }}
                </p>
              </div>

              <!-- Like / comment / share (commented out for now) -->
              <!--
              <div class="px-5 py-3 border-t border-white/10 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <button class="text-white/85 hover:text-white transition-colors" type="button">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                      <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.6 3 2 5 2C6.1 2 7 2.6 7.5 3.1L8 3.7L8.5 3.1C9 2.6 9.9 2 11 2C13 2 14.5 3.6 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
                        stroke="currentColor" stroke-width="1.3" />
                    </svg>
                  </button>
                  <button class="text-white/85 hover:text-white transition-colors" type="button">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                      <path d="M14 8C14 11.3 11.3 14 8 14C6.9 14 5.9 13.7 5 13.2L2 14L2.8 11C2.3 10.1 2 9.1 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8Z"
                        stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button class="text-white/85 hover:text-white transition-colors" type="button">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                      <path d="M2.5 8.3L13.5 2.5L9.7 13.5L7.7 8.9L2.5 8.3Z"
                        stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>

                <div class="flex items-center gap-4 text-white/70 text-xs">
                  <span>2 Likes</span>
                  <span>{{ comments?.length ?? 0 }} Comment</span>
                </div>
              </div>
              -->
            </div>
          </div>

          <!-- Comment input (commented out for now) -->
          <!--
          <div class="fixed left-0 right-0 bottom-0 px-4 pb-5 pt-3 bg-black/35 border-t border-white/10">
            <div class="flex items-center gap-3">
              <button type="button" class="text-white/70 hover:text-white transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                    stroke="currentColor" stroke-width="1.5" />
                  <path d="M8.5 10C8.5 10.6 8.1 11 7.5 11C6.9 11 6.5 10.6 6.5 10C6.5 9.4 6.9 9 7.5 9C8.1 9 8.5 9.4 8.5 10Z"
                    fill="currentColor" />
                  <path d="M17.5 10C17.5 10.6 17.1 11 16.5 11C15.9 11 15.5 10.6 15.5 10C15.5 9.4 15.9 9 16.5 9C17.1 9 17.5 9.4 17.5 10Z"
                    fill="currentColor" />
                  <path d="M8 15C9.3 16.2 10.7 16.8 12 16.8C13.3 16.8 14.7 16.2 16 15"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Add a comment..."
                class="flex-1 bg-transparent text-white/90 placeholder:text-white/40 text-sm focus:outline-none"
              />

              <button type="button" class="text-white/80 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          -->
        </div>

        <!-- ── Desktop thumbnail strip ────────────────────────────────────── -->
        <div class="hidden md:flex items-center gap-2 px-4 py-2 flex-shrink-0 overflow-x-auto">
          <button v-for="(item, i) in items" :key="item.id"
            class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2"
            :class="i === currentIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'"
            @click="currentIndex = i">
            <img v-if="isVisual(item)" :src="item.thumbnail || item.url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-[#5e5f5f] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M6 4V14M6 4L13 2.5V12.5M6 14C6 15.1 5.1 16 4 16C2.9 16 2 15.1 2 14C2 12.9 2.9 12 4 12C5.1 12 6 12.9 6 14ZM13 12.5C13 13.6 12.1 14.5 11 14.5C9.9 14.5 9 13.6 9 12.5C9 11.4 9.9 10.5 11 10.5C12.1 10.5 13 11.4 13 12.5Z"
                  stroke="white" stroke-width="1.3" stroke-linecap="round" />
              </svg>
            </div>
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
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

// Prevent background scroll while the viewer is open (mobile + iOS rubber-band safe)
let lockedScrollY = 0
const lockBodyScroll = () => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    lockedScrollY = window.scrollY || 0
    const body = document.body
    if (!body) return
    body.style.position = 'fixed'
    body.style.top = `-${lockedScrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
  } catch {
    // If scroll-lock fails, don't break the viewer.
  }
}
const unlockBodyScroll = () => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    const body = document.body
    if (!body) return
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
    window.scrollTo(0, lockedScrollY)
  } catch {
    // no-op
  }
}

// Reset video state when item changes
watch(currentIndex, () => {
  videoPlaying.value = false
  videoTime.value = 0
  videoDuration.value = 0
  videoSeek.value = 0
})

// Sync initialIndex when show toggles on
watch(() => props.show, async (val) => {
  if (val) {
    currentIndex.value = props.initialIndex
    await nextTick()
    overlayRef.value?.focus()
    lockBodyScroll()
  } else {
    unlockBodyScroll()
  }
})

onBeforeUnmount(() => {
  if (props.show) unlockBodyScroll()
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
