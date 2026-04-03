<template>
  <div class="bg-neutral-100 rounded-2xl p-4 flex flex-col gap-3">
    <!-- Waveform bars (static) -->
    <div class="flex items-center gap-[2px] h-10 px-2">
      <div v-for="i in 48" :key="i" class="flex-1 rounded-full"
        :class="i / 48 <= progress ? 'bg-primary-600' : 'bg-neutral-300'"
        :style="{ height: staticBars[i % staticBars.length] + '%' }" />
    </div>

    <!-- Timeline -->
    <div class="flex items-center gap-2">
      <span class="text-[11px] text-neutral-500 w-8 text-right">{{ formatTime(currentTime) }}</span>
      <input v-model.number="seekValue" type="range" min="0" :max="duration" step="0.1"
        class="flex-1 h-1 accent-primary-700" :disabled="!duration" @input="onSeek" />
      <span class="text-[11px] text-neutral-500 w-8">{{ formatTime(duration) }}</span>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between">
      <div></div>
      <div class="flex items-center justify-center gap-5">
        <button class="text-neutral-400 hover:text-neutral-700 transition-colors" @click="skip(-15)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.4299 16.9203H12.1399C11.7299 16.9203 11.3899 16.5803 11.3899 16.1703C11.3899 15.7603 11.7299 15.4203 12.1399 15.4203H14.4299C14.8599 15.4203 15.21 15.0703 15.21 14.6403C15.21 14.2103 14.8599 13.8603 14.4299 13.8603H12.1399C11.8999 13.8603 11.67 13.7403 11.53 13.5503C11.39 13.3603 11.3499 13.1003 11.4299 12.8703L12.1899 10.5803C12.2899 10.2703 12.58 10.0703 12.9 10.0703H15.96C16.37 10.0703 16.71 10.4103 16.71 10.8203C16.71 11.2303 16.37 11.5703 15.96 11.5703H13.4399L13.1799 12.3603H14.4299C15.6899 12.3603 16.71 13.3803 16.71 14.6403C16.71 15.9003 15.6799 16.9203 14.4299 16.9203Z"
              fill="#807F94" />
            <path
              d="M9.54004 16.9198C9.13004 16.9198 8.79004 16.5798 8.79004 16.1698V12.7799L8.60003 12.9998C8.32003 13.3098 7.85004 13.3298 7.54004 13.0598C7.23004 12.7798 7.21004 12.3098 7.48004 11.9998L8.98004 10.3298C9.19004 10.0998 9.52006 10.0198 9.81006 10.1298C10.1001 10.2398 10.29 10.5198 10.29 10.8298V16.1798C10.29 16.5898 9.96004 16.9198 9.54004 16.9198Z"
              fill="#807F94" />
            <path
              d="M13.9797 5.21973C13.7597 5.21973 13.5398 5.11976 13.3998 4.93976L11.4197 2.46973C11.1597 2.14973 11.2097 1.66974 11.5397 1.41974C11.8597 1.15974 12.3298 1.20973 12.5898 1.53973L14.5698 4.00977C14.8298 4.32977 14.7798 4.80975 14.4498 5.05975C14.3098 5.15975 14.1397 5.21973 13.9797 5.21973Z"
              fill="#807F94" />
            <path
              d="M11.9999 22.7498C6.68988 22.7498 2.35986 18.4297 2.35986 13.1097C2.35986 7.78974 6.67988 3.46973 11.9999 3.46973C12.6899 3.46973 13.3899 3.54974 14.1499 3.72974C14.5499 3.81974 14.8099 4.22976 14.7099 4.62976C14.6199 5.02976 14.2099 5.28976 13.8099 5.18976C13.1699 5.03976 12.5699 4.96973 11.9999 4.96973C7.50988 4.96973 3.85986 8.61974 3.85986 13.1097C3.85986 17.5997 7.50988 21.2498 11.9999 21.2498C16.4899 21.2498 20.1399 17.5997 20.1399 13.1097C20.1399 11.3697 19.5699 9.68976 18.4899 8.24976C18.2399 7.91976 18.3099 7.44977 18.6399 7.19977C18.9699 6.94977 19.4399 7.01973 19.6899 7.34973C20.9699 9.04973 21.6399 11.0397 21.6399 13.1097C21.6399 18.4297 17.3099 22.7498 11.9999 22.7498Z"
              fill="#807F94" />
          </svg>
          <span class="sr-only">-15s</span>
        </button>

        <!-- Play / Pause -->
        <button
          class="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center hover:bg-primary-800 transition-colors"
          @click="togglePlay">
          <svg v-if="!playing" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 2L14 8L4 14V2Z" fill="white" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="2" width="3.5" height="12" rx="1" fill="white" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="white" />
          </svg>
        </button>

        <button class="text-neutral-400 hover:text-neutral-700 transition-colors" @click="skip(15)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.4299 16.9203H12.1399C11.7299 16.9203 11.3899 16.5803 11.3899 16.1703C11.3899 15.7603 11.7299 15.4203 12.1399 15.4203H14.4299C14.8599 15.4203 15.21 15.0703 15.21 14.6403C15.21 14.2103 14.8599 13.8603 14.4299 13.8603H12.1399C11.8999 13.8603 11.67 13.7403 11.53 13.5503C11.39 13.3603 11.3499 13.1003 11.4299 12.8703L12.1899 10.5803C12.2899 10.2703 12.58 10.0703 12.9 10.0703H15.96C16.37 10.0703 16.71 10.4103 16.71 10.8203C16.71 11.2303 16.37 11.5703 15.96 11.5703H13.4399L13.1799 12.3603H14.4299C15.6899 12.3603 16.71 13.3803 16.71 14.6403C16.71 15.9003 15.6799 16.9203 14.4299 16.9203Z"
              fill="#807F94" />
            <path
              d="M9.54004 16.9198C9.13004 16.9198 8.79004 16.5798 8.79004 16.1698V12.7799L8.60003 12.9998C8.32003 13.3098 7.85004 13.3298 7.54004 13.0598C7.23004 12.7798 7.21004 12.3098 7.48004 11.9998L8.98004 10.3298C9.19004 10.0998 9.52006 10.0198 9.81006 10.1298C10.1001 10.2398 10.29 10.5198 10.29 10.8298V16.1798C10.29 16.5898 9.96004 16.9198 9.54004 16.9198Z"
              fill="#807F94" />
            <path
              d="M13.9797 5.21973C13.7597 5.21973 13.5398 5.11976 13.3998 4.93976L11.4197 2.46973C11.1597 2.14973 11.2097 1.66974 11.5397 1.41974C11.8597 1.15974 12.3298 1.20973 12.5898 1.53973L14.5698 4.00977C14.8298 4.32977 14.7798 4.80975 14.4498 5.05975C14.3098 5.15975 14.1397 5.21973 13.9797 5.21973Z"
              fill="#807F94" />
            <path
              d="M11.9999 22.7498C6.68988 22.7498 2.35986 18.4297 2.35986 13.1097C2.35986 7.78974 6.67988 3.46973 11.9999 3.46973C12.6899 3.46973 13.3899 3.54974 14.1499 3.72974C14.5499 3.81974 14.8099 4.22976 14.7099 4.62976C14.6199 5.02976 14.2099 5.28976 13.8099 5.18976C13.1699 5.03976 12.5699 4.96973 11.9999 4.96973C7.50988 4.96973 3.85986 8.61974 3.85986 13.1097C3.85986 17.5997 7.50988 21.2498 11.9999 21.2498C16.4899 21.2498 20.1399 17.5997 20.1399 13.1097C20.1399 11.3697 19.5699 9.68976 18.4899 8.24976C18.2399 7.91976 18.3099 7.44977 18.6399 7.19977C18.9699 6.94977 19.4399 7.01973 19.6899 7.34973C20.9699 9.04973 21.6399 11.0397 21.6399 13.1097C21.6399 18.4297 17.3099 22.7498 11.9999 22.7498Z"
              fill="#807F94" />
          </svg>
          <span class="sr-only">+15s</span>
        </button>
      </div>
      <div role="button" class="cursor-pointer" @click="deleteAudio">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
            stroke="#FF1717" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9.16992 14.8299L14.8299 9.16992" stroke="#FF1717" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M14.8299 14.8299L9.16992 9.16992" stroke="#FF1717" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        <span class="sr-only">Delete</span>
      </div>
    </div>

    <audio ref="audioEl" :src="audioUrl" @timeupdate="onTimeUpdate" @loadedmetadata="onLoaded" @seeked="onSeeked"
      @ended="playing = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{ audioUrl: string; title?: string }>()
const emit = defineEmits<{
  (e: 'delete-audio'): void
}>()


const audioEl = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const seekValue = ref(0)
const fixingDuration = ref(false)

const staticBars = Array.from({ length: 30 }, () => Math.floor(Math.random() * 70 + 15))

const progress = computed(() => (duration.value ? currentTime.value / duration.value : 0))

const formatTime = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const togglePlay = () => {
  if (!audioEl.value) return
  if (playing.value) { audioEl.value.pause(); playing.value = false }
  else { audioEl.value.play(); playing.value = true }
}

const onTimeUpdate = () => {
  currentTime.value = audioEl.value?.currentTime ?? 0
  seekValue.value = currentTime.value
}

const onLoaded = () => {
  const d = audioEl.value?.duration ?? 0
  if (isFinite(d) && d > 0) {
    duration.value = d
  } else {
    // MediaRecorder blobs lack duration metadata — seek to end to force the browser
    // to scan the file and report the real duration via the `seeked` event.
    fixingDuration.value = true
    audioEl.value!.currentTime = Number.MAX_SAFE_INTEGER
  }
}

const deleteAudio = () => {
  emit('delete-audio')
}

const onSeeked = () => {
  if (!audioEl.value || !fixingDuration.value) return
  fixingDuration.value = false
  duration.value = audioEl.value.duration
  audioEl.value.currentTime = 0
}

const onSeek = () => {
  if (audioEl.value) audioEl.value.currentTime = seekValue.value
}

const skip = (sec: number) => {
  if (audioEl.value) audioEl.value.currentTime = Math.max(0, Math.min(duration.value, audioEl.value.currentTime + sec))
}
</script>
