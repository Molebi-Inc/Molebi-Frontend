<template>
  <div class="flex flex-col">
    <!-- Tabs: Upload File | Record Audio -->
    <div class="flex border-b border-neutral-200 mb-5">
      <button
        v-for="tab in (['Upload File', 'Record Audio'] as const)"
        :key="tab"
        class="flex-1 py-2.5 text-sm font-medium transition-colors relative"
        :class="activeTab === tab ? 'text-primary-700' : 'text-neutral-500 hover:text-neutral-700'"
        @click="activeTab = tab; reset()"
      >
        {{ tab }}
        <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700 rounded-full" />
      </button>
    </div>

    <!-- Upload File tab -->
    <div v-if="activeTab === 'Upload File'" class="flex flex-col items-center gap-4">
      <div v-if="!uploadedFile">
        <MediaUploadDropzone
          accept="audio/*"
          label="Drag audio file here"
          @files="onAudioFileSelected"
        />
      </div>
      <div v-else class="w-full">
        <AudioPreviewPlayer :audio-url="audioUrl!" :title="uploadedFile.name" />
      </div>
    </div>

    <!-- Record Audio tab -->
    <div v-else class="flex flex-col items-center gap-5 min-h-[200px]">

      <!-- Idle: waiting to record -->
      <div v-if="recordState === 'idle'" class="flex flex-col items-center gap-4 py-4">
        <button
          class="w-16 h-16 rounded-full bg-neutral-100 hover:bg-primary-50 border-2 border-neutral-300 hover:border-primary-400 flex items-center justify-center transition-all"
          @click="startRecording"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="2" width="10" height="16" rx="5" fill="#9CA3AF" />
            <path d="M5 13C5 18 9 22 14 22C19 22 23 18 23 13" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" />
            <path d="M14 22V26" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <p class="text-sm text-neutral-400">Tap to start recording</p>
      </div>

      <!-- Recording / Paused -->
      <div v-else-if="recordState === 'recording' || recordState === 'paused'" class="w-full flex flex-col gap-4">
        <div class="text-center">
          <p class="text-sm font-semibold text-neutral-800">Recording Title</p>
          <p class="text-xs text-neutral-400 mt-0.5">{{ formatTime(elapsed) }}</p>
        </div>

        <!-- Waveform animation -->
        <div class="flex items-center justify-center gap-[2px] h-12 px-4">
          <div
            v-for="i in 48"
            :key="i"
            class="w-1 rounded-full bg-neutral-400 transition-all"
            :style="{ height: waveformHeights[i % waveformHeights.length] + '%' }"
          />
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-center gap-6">
          <!-- Stop -->
          <button
            class="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
            @click="stopRecording"
          >
            <div class="w-4 h-4 rounded-sm bg-red-500" />
          </button>
          <!-- Pause / Resume -->
          <button
            class="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
            @click="togglePause"
          >
            <svg v-if="recordState === 'recording'" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="2" width="3.5" height="12" rx="1" fill="#3B82F6" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="#3B82F6" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 2L14 8L4 14V2Z" fill="#3B82F6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Recorded: show playback + controls -->
      <div v-else-if="recordState === 'recorded'" class="w-full flex flex-col gap-4">
        <div class="text-center">
          <p class="text-sm font-semibold text-neutral-800">Recording Title</p>
          <p class="text-xs text-neutral-400 mt-0.5">{{ formatTime(elapsed) }}</p>
        </div>

        <AudioPreviewPlayer v-if="audioUrl" :audio-url="audioUrl" :title="'Recording'" />

        <!-- Extra controls row: speed, download -->
        <div class="flex items-center justify-center gap-4 text-neutral-500">
          <button class="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V7L10 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/></svg>
            1x
          </button>
          <button class="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors" title="Download">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V9M4 6L7 9L10 6M2 12H12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-red-400" title="Delete" @click="reset">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5H12M5 3.5V2H9V3.5M5.5 6V10.5M8.5 6V10.5M3 3.5L3.5 12H10.5L11 3.5H3Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import MediaUploadDropzone from './MediaUploadDropzone.vue'
import AudioPreviewPlayer from './AudioPreviewPlayer.vue'

export type RecordedAudio = { blob: Blob; url: string; durationSec: number }

const emit = defineEmits<{
  (e: 'ready', audio: RecordedAudio | null): void
}>()

const activeTab = ref<'Upload File' | 'Record Audio'>('Upload File')
const recordState = ref<'idle' | 'recording' | 'paused' | 'recorded'>('idle')
const elapsed = ref(0)
const audioUrl = ref<string | null>(null)
const audioBlob = ref<Blob | null>(null)
const uploadedFile = ref<File | null>(null)

// Waveform animation
const waveformHeights = ref<number[]>(Array.from({ length: 20 }, () => 20))
let waveInterval: ReturnType<typeof setInterval> | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

const formatTime = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const animateWaveform = () => {
  waveInterval = setInterval(() => {
    waveformHeights.value = Array.from({ length: 20 }, () => Math.random() * 80 + 20)
  }, 100)
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks = []
    mediaRecorder = new MediaRecorder(stream)
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data) }
    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(audioChunks, { type: 'audio/webm' })
      audioUrl.value = URL.createObjectURL(audioBlob.value)
      stream.getTracks().forEach((t) => t.stop())
      emit('ready', { blob: audioBlob.value, url: audioUrl.value!, durationSec: elapsed.value })
    }
    mediaRecorder.start(100)
    recordState.value = 'recording'
    elapsed.value = 0
    timerInterval = setInterval(() => { elapsed.value++ }, 1000)
    animateWaveform()
  } catch {
    // Permission denied
  }
}

const stopRecording = () => {
  mediaRecorder?.stop()
  recordState.value = 'recorded'
  if (timerInterval) clearInterval(timerInterval)
  if (waveInterval) clearInterval(waveInterval)
  waveformHeights.value = Array.from({ length: 20 }, () => 30)
}

const togglePause = () => {
  if (!mediaRecorder) return
  if (recordState.value === 'recording') {
    mediaRecorder.pause()
    recordState.value = 'paused'
    if (waveInterval) clearInterval(waveInterval)
    waveformHeights.value = Array.from({ length: 20 }, () => 20)
  } else {
    mediaRecorder.resume()
    recordState.value = 'recording'
    animateWaveform()
  }
}

const onAudioFileSelected = (files: File[]) => {
  const file = files[0]
  if (!file) return
  uploadedFile.value = file
  audioUrl.value = URL.createObjectURL(file)
  audioBlob.value = file as unknown as Blob
  emit('ready', { blob: file, url: audioUrl.value, durationSec: 0 })
}

const reset = () => {
  mediaRecorder?.stop()
  mediaRecorder = null
  recordState.value = 'idle'
  elapsed.value = 0
  audioUrl.value = null
  audioBlob.value = null
  uploadedFile.value = null
  if (timerInterval) clearInterval(timerInterval)
  if (waveInterval) clearInterval(waveInterval)
  emit('ready', null)
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (waveInterval) clearInterval(waveInterval)
  mediaRecorder?.stop()
})
</script>
