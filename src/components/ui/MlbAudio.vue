<template>
  <div class="bg-gray-100 flex items-center justify-center p-4 rounded-2xl">
    <div class="w-full max-w-md">
      <!-- Permission Denied State -->
      <div v-if="permissionError" class="bg-white rounded-3xl p-8 text-center">
        <MlbIcon name="vuesax.bold.close-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-gray-800 mb-3">Microphone Access Denied</h2>
        <p class="text-gray-600 mb-6">{{ permissionError }}</p>
        <button
          @click="permissionError = null"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Dismiss
        </button>
      </div>

      <!-- Initial State: Tap to start -->
      <div v-else-if="state === 'idle'" class="bg-gray-100 rounded-3xl p-12 text-center">
        <MlbButton
          @click="startRecording"
          class="bg-white! text-gray-800! rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-12! h-12!"
          :disabled="isRequesting"
        >
          <template #icon>
            <MlbIcon name="vuesax.outline.microphone-2" class="w-7 h-7 text-gray-800" />
          </template>
          <span
            v-if="isRequesting"
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500!"
          ></span>
        </MlbButton>
        <p class="text-sm text-gray-800 font-medium mt-3">Tap to start recording</p>
      </div>

      <!-- Recording State -->
      <div v-else-if="state === 'recording'" class="bg-gray-100 rounded-3xl p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-3">Recording</h2>
          <div class="text-3xl font-mono text-gray-600">{{ formatTime(recordingTime) }}</div>
        </div>

        <!-- Waveform -->
        <div class="bg-white rounded-lg p-6 mb-8 overflow-hidden">
          <svg class="w-full h-16" viewBox="0 0 300 60" preserveAspectRatio="none">
            <g fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round">
              <line
                v-for="(height, i) in waveformBars"
                :key="i"
                :x1="i * 3"
                :y1="30"
                :x2="i * 3"
                :y2="30 - Math.max(height * 25, 1)"
              />
            </g>
          </svg>
        </div>

        <!-- Recording Controls -->
        <div class="flex justify-center gap-3.5">
          <button
            type="button"
            @click="stopRecording"
            class="bg-white w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg p-3"
          >
            <div
              class="w-6 h-6 bg-white rounded-xl border-6 border-red-500 hover:border-red-700"
            ></div>
          </button>
          <button
            type="button"
            @click="pauseRecording"
            class="bg-white w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg"
          >
            <MlbIcon
              :name="isRecorderPaused ? 'vuesax.bold.play-circle' : 'vuesax.bold.pause-circle'"
              class="w-6 h-6 text-gray-600 hover:text-gray-800"
            />
          </button>
        </div>
      </div>

      <!-- Playback State -->
      <div v-else-if="state === 'playback'" class="bg-gray-100 rounded-3xl p-8">
        <!-- Timeline -->
        <div class="mb-8">
          <div class="relative mb-3">
            <input
              type="range"
              min="0"
              :max="Math.max(playbackDuration, 0.1)"
              :value="playbackTime"
              :disabled="!playbackAudioUrl"
              @input="handlePlaybackTimeChange"
              class="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
              style="-webkit-appearance: none; appearance: none"
            />
          </div>
          <div class="flex justify-between text-sm text-gray-600 font-mono">
            <span>{{ formatTime(playbackTime) }}</span>
            <span>{{ formatTime(playbackDuration) }}</span>
          </div>
        </div>

        <!-- Playback Controls -->
        <div class="grid grid-cols-3 gap-6 mb-2">
          <div></div>
          <div class="col-span-1 flex items-center gap-5">
            <button
              type="button"
              @click="rewind"
              :disabled="!playbackAudioUrl"
              class="text-gray-600 hover:text-gray-800 transition flex flex-col items-center disabled:opacity-40 disabled:pointer-events-none"
            >
              <div
                class="border-2 border-gray-600 rounded-full w-6 h-6 flex items-center justify-center mb-1"
              >
                <span class="text-sm font-semibold">15</span>
              </div>
            </button>

            <button
              type="button"
              @click="togglePlayback"
              :disabled="!playbackAudioUrl"
              class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-900 transition shadow-lg disabled:opacity-40 disabled:pointer-events-none"
            >
              <MlbIcon name="vuesax.bold.play-circle" size="32" color="#807F94" v-if="!isPlaying" />
              <MlbIcon name="vuesax.bold.pause-circle" size="32" color="#807F94" v-else />
            </button>
            <button
              type="button"
              @click="forward"
              :disabled="!playbackAudioUrl"
              class="text-gray-600 hover:text-gray-800 transition flex flex-col items-center disabled:opacity-40 disabled:pointer-events-none"
            >
              <div
                class="border-2 border-gray-600 rounded-full w-6 h-6 flex items-center justify-center mb-1"
              >
                <span class="text-sm font-semibold">15</span>
              </div>
            </button>
          </div>
          <div class="col-span-1 flex items-center justify-end">
            <button
              type="button"
              @click="deleteRecording"
              class="text-red-500 hover:text-red-600 transition"
            >
              <div
                class="border-2 border-red-500 rounded-full w-6 h-6 flex items-center justify-center mb-1"
              >
                x
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <audio
      ref="audioElement"
      v-show="false"
      :src="playbackAudioUrl || undefined"
      preload="auto"
      @timeupdate="onAudioTimeUpdate"
      @loadedmetadata="onAudioLoaded"
      @ended="onAudioEnded"
      @play="onAudioPlay"
      @pause="onAudioPause"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'

type RecordingState = 'idle' | 'recording' | 'playback'

const emit = defineEmits<{
  (e: 'update:file-list', fileList: UploadFileInfo[]): void
}>()

const playbackTime = ref(0)
const recordingTime = ref(0)
const isPlaying = ref(false)
const isRequesting = ref(false)
const playbackDuration = ref(0)
const isRecorderPaused = ref(false)
const waveformBars = ref<number[]>([])
const state = ref<RecordingState>('idle')
const permissionError = ref<string | null>(null)
const playbackAudioUrl = ref<string | null>(null)
const audioElement = ref<HTMLAudioElement | null>(null)

let mediaRecorder: MediaRecorder | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let gainNode: GainNode | null = null
let animationFrameId: number | null = null
let stream: MediaStream | null = null
let recordingInterval: number | null = null
let recordedChunks: BlobPart[] = []
const recordedAudioBlob = ref<Blob | null>(null)

const clearRecordingTimer = () => {
  if (recordingInterval !== null) {
    clearInterval(recordingInterval)
    recordingInterval = null
  }
}

const startRecordingTimer = () => {
  clearRecordingTimer()
  recordingInterval = window.setInterval(() => {
    recordingTime.value = +(recordingTime.value + 0.1).toFixed(2)
  }, 100) as unknown as number
}

const revokePlaybackUrl = () => {
  if (playbackAudioUrl.value) {
    URL.revokeObjectURL(playbackAudioUrl.value)
    playbackAudioUrl.value = null
  }
}

const resetPlaybackState = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
  }
  isPlaying.value = false
  playbackTime.value = 0
}

const mimeTypeToExtension = (mime: string) => {
  if (mime.includes('mp3') || mime.includes('mpeg')) return 'mp3'
  if (mime.includes('mp4')) return 'mp4'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('wav')) return 'wav'
  if (mime.includes('webm')) return 'webm'
  return 'mp3'
}

const emitRecordingFile = (blob: Blob) => {
  const mimeType = 'audio/mpeg'
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `molebi-recording-${timestamp}.mp3`
  const file = new File([blob], fileName, { type: mimeType })
  const url = URL.createObjectURL(file)
  playbackAudioUrl.value = url
  playbackDuration.value = recordingTime.value

  const uploadFile: UploadFileInfo = {
    id: fileName,
    name: file.name,
    status: 'finished',
    percentage: 100,
    file,
    url,
  }
  console.log('uploadFile', uploadFile)

  emit('update:file-list', [uploadFile])
}

const preparePlayback = () => {
  if (!recordedAudioBlob.value) return
  resetPlaybackState()
  revokePlaybackUrl()
  emitRecordingFile(recordedAudioBlob.value)
  state.value = 'playback'
}

const startRecording = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    permissionError.value = 'Audio recording is not supported in this browser.'
    return
  }

  if (!window.MediaRecorder) {
    permissionError.value = 'MediaRecorder API is not available in this browser.'
    return
  }

  isRequesting.value = true
  permissionError.value = null
  recordedAudioBlob.value = null
  emit('update:file-list', [])
  resetPlaybackState()
  revokePlaybackUrl()

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0) {
      throw new Error('No audio tracks found in stream')
    }

    const options: MediaRecorderOptions = {}
    // if (MediaRecorder.isTypeSupported('audio/mp4')) {
    //   options.mimeType = 'audio/mp4'
    // } else if (MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
    //   options.mimeType = 'audio/mp4;codecs=mp4a.40.2'
    // } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    //   options.mimeType = 'audio/webm;codecs=opus'
    // } else if (MediaRecorder.isTypeSupported('audio/webm')) {
    //   options.mimeType = 'audio/webm'
    // }
    if (MediaRecorder.isTypeSupported('audio/mpeg')) {
      // Most common MP3 MIME type
      options.mimeType = 'audio/mpeg'
    } else if (MediaRecorder.isTypeSupported('audio/mpeg;codecs=mp3')) {
      // Alternative MP3 declaration, if supported
      options.mimeType = 'audio/mpeg;codecs=mp3'
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      options.mimeType = 'audio/mp4'
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options.mimeType = 'audio/webm;codecs=opus'
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      options.mimeType = 'audio/webm'
    }

    mediaRecorder = new MediaRecorder(stream, options)
    recordedChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      if (!mediaRecorder) return
      const blobType = mediaRecorder.mimeType || 'audio/mpeg'
      recordedAudioBlob.value = new Blob(recordedChunks, { type: blobType })
      preparePlayback()
    }

    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event)
      permissionError.value = 'An error occurred while recording audio.'
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioContext = new AudioContextClass({
      sampleRate: 44100,
    })

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.3

    gainNode = audioContext.createGain()
    gainNode.gain.value = 2

    const source = audioContext.createMediaStreamSource(stream)
    source.connect(gainNode)
    gainNode.connect(analyser)

    mediaRecorder.start(100)
    state.value = 'recording'
    isRecorderPaused.value = false
    recordingTime.value = 0
    startRecordingTimer()
    updateWaveform()
  } catch (error) {
    console.error(error)
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        permissionError.value = 'You denied microphone access. Please allow it to record audio.'
      } else if (error.name === 'NotFoundError') {
        permissionError.value = 'No microphone found on this device.'
      } else {
        permissionError.value = `Error accessing microphone: ${error.message}`
      }
    } else {
      permissionError.value = 'An unknown error occurred while accessing the microphone.'
    }
  } finally {
    isRequesting.value = false
  }
}

const updateWaveform = () => {
  if (state.value !== 'recording' || !analyser || !audioContext) {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    return
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch((error) => {
      console.error('Failed to resume AudioContext:', error)
    })
  }

  try {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    const bars: number[] = []
    const step = Math.max(1, Math.floor(bufferLength / 100))

    for (let i = 0; i < 100; i++) {
      const index = i * step
      const arrayValue = dataArray[index] ?? 0
      const normalizedValue = arrayValue / 255
      const scaledValue = Math.sqrt(normalizedValue)
      bars.push(Math.max(scaledValue, 0.05))
    }

    waveformBars.value = bars
    animationFrameId = requestAnimationFrame(updateWaveform)
  } catch (error) {
    console.error('Error updating waveform:', error)
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
}

const cleanupAudioGraph = () => {
  if (gainNode) {
    gainNode.disconnect()
    gainNode = null
  }
  if (analyser) {
    analyser.disconnect()
    analyser = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  clearRecordingTimer()

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (stream) {
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    stream = null
  }

  cleanupAudioGraph()
  isRecorderPaused.value = false
}

const pauseRecording = () => {
  if (!mediaRecorder) {
    return
  }

  if (mediaRecorder.state === 'recording') {
    mediaRecorder.pause()
    clearRecordingTimer()
    isRecorderPaused.value = true
  } else if (mediaRecorder.state === 'paused') {
    mediaRecorder.resume()
    startRecordingTimer()
    isRecorderPaused.value = false
  }
}

const togglePlayback = async () => {
  if (!audioElement.value || !playbackAudioUrl.value) return
  try {
    if (isPlaying.value) {
      audioElement.value.pause()
    } else {
      await audioElement.value.play()
    }
  } catch (error) {
    console.error('Error toggling playback:', error)
  }
}

const rewind = () => {
  if (!audioElement.value) return
  audioElement.value.currentTime = Math.max(0, audioElement.value.currentTime - 15)
}

const forward = () => {
  if (!audioElement.value) return
  audioElement.value.currentTime = Math.min(
    playbackDuration.value,
    audioElement.value.currentTime + 15,
  )
}

const handlePlaybackTimeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseFloat(target.value)
  playbackTime.value = value
  if (audioElement.value) {
    audioElement.value.currentTime = value
  }
}

const deleteRecording = () => {
  resetPlaybackState()
  revokePlaybackUrl()
  emit('update:file-list', [])
  recordedAudioBlob.value = null
  recordingTime.value = 0
  playbackDuration.value = 0
  state.value = 'idle'
  isRecorderPaused.value = false

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  clearRecordingTimer()

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (stream) {
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    stream = null
  }

  cleanupAudioGraph()
}

const onAudioTimeUpdate = () => {
  if (!audioElement.value) return
  playbackTime.value = audioElement.value.currentTime
}

const onAudioLoaded = () => {
  if (!audioElement.value) return
  if (Number.isFinite(audioElement.value.duration)) {
    playbackDuration.value = audioElement.value.duration
  }
}

const onAudioEnded = () => {
  isPlaying.value = false
  playbackTime.value = playbackDuration.value
}

const onAudioPlay = () => {
  isPlaying.value = true
}

const onAudioPause = () => {
  isPlaying.value = false
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds)) {
    return '00:00:00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`
}

onUnmounted(() => {
  deleteRecording()
  revokePlaybackUrl()
})
</script>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6b7280;
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6b7280;
  cursor: pointer;
  border: none;
}
</style>
