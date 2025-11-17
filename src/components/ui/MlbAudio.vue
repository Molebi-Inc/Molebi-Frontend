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
        <!-- <div class="bg-white rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <MlbIcon name="vuesax.outline.microphone-2" class="w-10 h-10 text-gray-800" />
        </div> -->
        <MlbButton
          @click="startRecording"
          class="bg-white! text-gray-800! rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isRequesting"
        >
          <template #icon>
            <MlbIcon name="vuesax.outline.microphone-2" class="w-7 h-7 text-gray-800" />
          </template>
          <span v-if="isRequesting">Requesting Permission...</span>
        </MlbButton>
        <p class="text-sm text-gray-800 font-medium">Tap to start recording</p>
      </div>

      <!-- Recording State -->
      <div v-else-if="state === 'recording'" class="bg-gray-100 rounded-3xl p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-3">Recording Title</h2>
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
        <div class="flex justify-center gap-6">
          <button
            @click="stopRecording"
            class="bg-red-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center hover:bg-red-600 transition shadow-lg"
          >
            <div class="w-6 h-6 bg-white rounded-sm"></div>
          </button>
          <button
            @click="pauseRecording"
            class="bg-gray-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center hover:bg-gray-600 transition shadow-lg"
          >
            <MlbIcon
              name="vuesax.bold.pause-circle"
              class="w-7 h-7 text-gray-800"
              v-if="!isPlaying"
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
              max="12.32"
              :value="playbackTime"
              @input="handlePlaybackTimeChange"
              class="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              style="-webkit-appearance: none; appearance: none"
            />
          </div>
          <div class="flex justify-between text-sm text-gray-600 font-mono">
            <span>{{ formatTime(playbackTime) }}</span>
            <span>12.32</span>
          </div>
        </div>

        <!-- Playback Controls -->
        <div class="flex items-center justify-center gap-6 mb-2">
          <button
            @click="rewind"
            class="text-gray-600 hover:text-gray-800 transition flex flex-col items-center"
          >
            <div
              class="border-2 border-gray-600 rounded-full w-12 h-12 flex items-center justify-center mb-1"
            >
              <span class="text-sm font-semibold">15</span>
            </div>
          </button>

          <button
            @click="togglePlayback"
            class="bg-gray-600 text-white w-16 h-16 rounded-full flex items-center justify-center hover:bg-gray-700 transition shadow-lg"
          >
            <MlbIcon
              name="vuesax.bold.play-circle"
              class="w-7 h-7 text-gray-800"
              v-if="!isPlaying"
            />
            <MlbIcon name="vuesax.bold.pause-circle" class="w-7 h-7 text-gray-800" v-else />
          </button>

          <button
            @click="forward"
            class="text-gray-600 hover:text-gray-800 transition flex flex-col items-center"
          >
            <div
              class="border-2 border-gray-600 rounded-full w-12 h-12 flex items-center justify-center mb-1"
            >
              <span class="text-sm font-semibold">15</span>
            </div>
          </button>

          <button
            @click="deleteRecording"
            class="text-red-500 hover:text-red-600 transition flex flex-col items-center"
          >
            <div
              class="border-2 border-red-500 rounded-full w-12 h-12 flex items-center justify-center mb-1"
            >
              <MlbIcon name="vuesax.bold.close-circle" class="w-7 h-7 text-gray-800" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
type RecordingState = 'idle' | 'recording' | 'playback'

const state = ref<RecordingState>('idle')
const recordingTime = ref(0)
const playbackTime = ref(0)
const isPlaying = ref(false)
const waveformBars = ref<number[]>([])
const permissionError = ref<string | null>(null)
const isRequesting = ref(false)

let mediaRecorder: MediaRecorder | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let gainNode: GainNode | null = null
let animationFrameId: number | null = null
let stream: MediaStream | null = null
let recordingInterval: number | null = null
let playbackInterval: number | null = null
let recordedChunks: BlobPart[] = []
const recordedAudioBlob = ref<Blob | null>(null)

const startRecording = async () => {
  isRequesting.value = true
  permissionError.value = null

  try {
    // Request microphone access with constraints
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    // Check if we have an audio track
    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0) {
      throw new Error('No audio tracks found in stream')
    }

    const audioTrack = audioTracks[0]
    if (audioTrack) {
      console.log('Audio track:', audioTrack.label, audioTrack.enabled, audioTrack.readyState)
    }

    // Initialize audio recording with preferred MIME type
    const options: MediaRecorderOptions = {}
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options.mimeType = 'audio/webm;codecs=opus'
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      options.mimeType = 'audio/webm'
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      options.mimeType = 'audio/mp4'
    }

    mediaRecorder = new MediaRecorder(stream, options)
    recordedChunks = []

    console.log('MediaRecorder created with MIME type:', mediaRecorder.mimeType || 'default')

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data)
        console.log('Data available:', e.data.size, 'bytes')
      }
    }

    mediaRecorder.onstop = () => {
      if (!mediaRecorder) return
      const blobType = mediaRecorder.mimeType || 'audio/webm'
      recordedAudioBlob.value = new Blob(recordedChunks, { type: blobType })
      console.log(
        'Recording stopped. Total chunks:',
        recordedChunks.length,
        'Blob size:',
        recordedAudioBlob.value.size,
      )
    }

    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event)
      permissionError.value = 'An error occurred while recording audio.'
    }

    // Initialize Web Audio API for visualizer
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioContext = new AudioContextClass({
      sampleRate: 44100, // Standard sample rate
    })

    console.log('AudioContext state:', audioContext.state)

    // Resume audio context if suspended (required by modern browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
      console.log('AudioContext resumed. New state:', audioContext.state)
    }

    if (audioContext.state !== 'running') {
      console.warn('AudioContext is not running:', audioContext.state)
    }

    analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048 // Increased for better frequency resolution
    analyser.smoothingTimeConstant = 0.3 // Lower value for more responsive visualization
    analyser.minDecibels = -90
    analyser.maxDecibels = -10

    // Create a gain node to amplify the signal for better visualization
    // Note: This doesn't affect the recording, only the visualization
    gainNode = audioContext.createGain()
    gainNode.gain.value = 2.0 // Amplify by 2x for visualization

    const source = audioContext.createMediaStreamSource(stream)
    source.connect(gainNode)
    gainNode.connect(analyser)

    console.log(
      'Audio analyser connected. FFT size:',
      analyser.fftSize,
      'Frequency bins:',
      analyser.frequencyBinCount,
    )

    // Note: We don't connect to destination to avoid audio feedback
    // The analyser will still process the audio for visualization

    // Start recording with timeslice to ensure data is collected regularly
    // Timeslice of 100ms ensures we get data chunks frequently for visualization
    mediaRecorder.start(100)
    state.value = 'recording'
    recordingTime.value = 0

    // Update waveform visualization
    recordingInterval = window.setInterval(() => {
      recordingTime.value += 0.1
    }, 100) as unknown as number

    updateWaveform()
  } catch (error) {
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
    // If not recording, stop the animation
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    return
  }

  // Resume audio context if it was suspended (some browsers suspend to save battery)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch((error) => {
      console.error('Failed to resume AudioContext:', error)
    })
  }

  if (audioContext.state !== 'running') {
    // If context is not running, still try to continue but log a warning
    console.warn('AudioContext state is not running:', audioContext.state)
  }

  try {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Get frequency data for visualization
    analyser.getByteFrequencyData(dataArray)

    // Downsample to 100 bars for visualization
    const bars: number[] = []
    const step = Math.floor(bufferLength / 100)

    for (let i = 0; i < 100; i++) {
      const index = i * step
      if (index >= 0 && index < bufferLength) {
        const arrayValue = dataArray[index] ?? 0
        // Normalize value (0-255) to 0-1
        // Apply exponential scaling to make quiet sounds more visible
        const normalizedValue = arrayValue / 255
        // Use square root scaling to emphasize lower values for better visibility
        const scaledValue = Math.sqrt(normalizedValue)
        bars.push(Math.max(scaledValue, 0.05))
      } else {
        bars.push(0.05)
      }
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

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  if (recordingInterval !== null) {
    clearInterval(recordingInterval)
    recordingInterval = null
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (stream) {
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    stream = null
  }

  if (audioContext) {
    // Disconnect nodes before closing
    if (gainNode) {
      gainNode.disconnect()
      gainNode = null
    }
    if (analyser) {
      analyser.disconnect()
    }
    audioContext.close()
    audioContext = null
    analyser = null
  }

  state.value = 'playback'
  playbackTime.value = recordingTime.value
}

const pauseRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause()
  }
  state.value = 'playback'
}

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    playbackInterval = window.setInterval(() => {
      playbackTime.value += 0.1
      if (playbackTime.value >= 12.32) {
        playbackTime.value = 0
        isPlaying.value = false
        if (playbackInterval !== null) {
          clearInterval(playbackInterval)
        }
      }
    }, 100) as unknown as number
  } else {
    if (playbackInterval !== null) {
      clearInterval(playbackInterval)
    }
  }
}

const rewind = () => {
  playbackTime.value = Math.max(0, playbackTime.value - 15)
}

const forward = () => {
  playbackTime.value = Math.min(12.32, playbackTime.value + 15)
}

const handlePlaybackTimeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target) {
    playbackTime.value = parseFloat(target.value)
  }
}

const deleteRecording = () => {
  if (playbackInterval !== null) {
    clearInterval(playbackInterval)
    playbackInterval = null
  }
  if (recordingInterval !== null) {
    clearInterval(recordingInterval)
    recordingInterval = null
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (stream) {
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    stream = null
  }
  if (audioContext) {
    // Disconnect nodes before closing
    if (gainNode) {
      gainNode.disconnect()
      gainNode = null
    }
    if (analyser) {
      analyser.disconnect()
    }
    audioContext.close()
    audioContext = null
    analyser = null
  }
  state.value = 'idle'
  recordingTime.value = 0
  playbackTime.value = 0
  isPlaying.value = false
  recordedAudioBlob.value = null
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`
}

onUnmounted(() => {
  if (recordingInterval !== null) {
    clearInterval(recordingInterval)
  }
  if (playbackInterval !== null) {
    clearInterval(playbackInterval)
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  if (stream) {
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
  }

  if (audioContext) {
    audioContext.close()
  }
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
