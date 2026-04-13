<template>
  <div class="border-t border-neutral-100">
    <div class="flex items-center justify-between px-5 py-4 cursor-pointer select-none" @click="open = !open">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Memories</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          class="w-4 h-4 text-neutral-400 transition-transform duration-200" :class="open ? 'rotate-180' : ''">
          <path fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd" />
        </svg>
      </div>
      <button type="button"
        class="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
        @click.stop="goToMemories">
        + Add
      </button>
    </div>

    <div v-if="open" class="px-5 pb-5">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <template v-else-if="items.length === 0">
        <p class="text-sm text-neutral-400 text-center py-2">No memories yet.</p>
      </template>
      <template v-else>
        <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
          <template v-for="item in previewItems" :key="item.id">
            <a :href="item.url" target="_blank" rel="noopener noreferrer"
              class="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 ring-1 ring-neutral-200/80 block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              <img v-if="isImage(item)" :src="item.url" :alt="item.title || item.file_name"
                class="w-full h-full object-cover" loading="lazy" />
              <div v-else-if="isVideo(item)"
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900">
                <div class="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                  <svg class="w-5 h-5 text-neutral-800 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
              </div>
              <div v-else-if="isAudio(item)"
                class="w-full h-full flex flex-col items-center justify-center gap-1 bg-violet-50 p-2">
                <span
                  class="text-[10px] font-bold uppercase tracking-wide text-violet-700 bg-violet-200/80 px-1.5 py-0.5 rounded">MP3</span>
                <svg class="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div v-else class="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-500 text-xs p-1 text-center">
                {{ item.file_name }}
              </div>
            </a>
          </template>

          <button v-if="showViewMore" type="button"
            class="aspect-square rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50/50 transition-colors text-[10px] font-semibold uppercase tracking-wide"
            @click="goToMemories">
            View more
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { TaggedMediaInterface } from '@/types/family-tree.types'

const props = defineProps<{
  items: TaggedMediaInterface[]
  loading?: boolean
}>()

const router = useRouter()
const open = ref(true)

const previewItems = computed(() => props.items.slice(0, 9))
const showViewMore = computed(() => props.items.length > 9)

function isImage(m: TaggedMediaInterface) {
  const t = (m.media_type || '').toLowerCase()
  if (t === 'image' || t === 'photo') return true
  return (m.mime_type || '').startsWith('image/')
}

function isVideo(m: TaggedMediaInterface) {
  const t = (m.media_type || '').toLowerCase()
  if (t === 'video') return true
  return (m.mime_type || '').startsWith('video/')
}

function isAudio(m: TaggedMediaInterface) {
  const t = (m.media_type || '').toLowerCase()
  if (t === 'audio') return true
  return (m.mime_type || '').startsWith('audio/')
}

function goToMemories() {
  router.push({ name: 'App.StorageFolderView' })
}
</script>
