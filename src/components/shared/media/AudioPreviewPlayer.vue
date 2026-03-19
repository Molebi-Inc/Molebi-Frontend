<template>
  <div class="bg-neutral-100 rounded-2xl p-4 flex flex-col gap-3">
    <!-- Waveform bars (static) -->
    <div class="flex items-center gap-[2px] h-10 px-2">
      <div
        v-for="i in 48"
        :key="i"
        class="w-1 rounded-full"
        :class="i / 48 <= progress ? 'bg-primary-600' : 'bg-neutral-300'"
        :style="{ height: staticBars[i % staticBars.length] + '%' }"
      />
    </div>

    <!-- Timeline -->
    <div class="flex items-center gap-2">
      <span class="text-[11px] text-neutral-500 w-8 text-right">{{ formatTime(currentTime) }}</span>
      <input
        v-model.number="seekValue"
        type="range"
        min="0"
        :max="duration || 100"
        step="0.1"
        class="flex-1 h-1 accent-primary-700"
        @input="onSeek"
      />
      <span class="text-[11px] text-neutral-500 w-8">{{ formatTime(duration) }}</span>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-5">
      <button class="text-neutral-400 hover:text-neutral-700 transition-colors" @click="skip(-10)">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L4 8H8V18H12V8H16L10 2Z" fill="currentColor" transform="rotate(90 10 10) scale(-1,1) translate(-20,0)"/><text x="6" y="15" font-size="5" fill="currentColor">10</text></svg>
        <span class="sr-only">-10s</span>
      </button>

      <!-- Play / Pause -->
      <button
        class="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center hover:bg-primary-800 transition-colors"
        @click="togglePlay"
      >
        <svg v-if="!playing" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 2L14 8L4 14V2Z" fill="white" />
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="2" width="3.5" height="12" rx="1" fill="white" />
          <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="white" />
        </svg>
      </button>

      <button class="text-neutral-400 hover:text-neutral-700 transition-colors" @click="skip(10)">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L16 8H12V18H8V8H4L10 2Z" fill="currentColor"/><text x="6" y="15" font-size="5" fill="currentColor">10</text></svg>
        <span class="sr-only">+10s</span>
      </button>
    </div>

    <audio ref="audioEl" :src="audioUrl" @timeupdate="onTimeUpdate" @loadedmetadata="onLoaded" @ended="playing = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{ audioUrl: string; title?: string }>()

const audioEl = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const seekValue = ref(0)

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

const onLoaded = () => { duration.value = audioEl.value?.duration ?? 0 }

const onSeek = () => {
  if (audioEl.value) audioEl.value.currentTime = seekValue.value
}

const skip = (sec: number) => {
  if (audioEl.value) audioEl.value.currentTime = Math.max(0, Math.min(duration.value, audioEl.value.currentTime + sec))
}
</script>
