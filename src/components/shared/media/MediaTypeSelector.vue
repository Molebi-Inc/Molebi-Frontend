<template>
  <div class="px-2 py-1">
    <p class="text-center text-sm text-neutral-500 mb-5">Select Content Type</p>
    <div class="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50/30">
      <div class="flex gap-4">
        <!-- Photos & Videos -->
        <button
          class="flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-primary-400 hover:shadow-md transition-all group"
          @click="$emit('select', 'photo-video')"
        >
          <div class="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="24" height="17" rx="3" fill="#C4B5FD" />
              <circle cx="9" cy="12" r="2.5" fill="white" />
              <path d="M2 19L8 14L13 18L18 13L26 19" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="18" y="2" width="8" height="8" rx="2" fill="#8B5CF6" />
              <path d="M21 4.5V7.5M19.5 6H22.5" stroke="white" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-neutral-900">Photos and Videos</p>
            <p class="text-xs text-neutral-400 mt-0.5">jpeg, PNG, MP4</p>
          </div>
        </button>

        <!-- Audio -->
        <button
          class="flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-primary-400 hover:shadow-md transition-all group"
          @click="$emit('select', 'audio')"
        >
          <div class="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 7V21M10 7L22 4.5V18.5M10 21C10 22.7 8.7 24 7 24C5.3 24 4 22.7 4 21C4 19.3 5.3 18 7 18C8.7 18 10 19.3 10 21ZM22 18.5C22 20.2 20.7 21.5 19 21.5C17.3 21.5 16 20.2 16 18.5C16 16.8 17.3 15.5 19 15.5C20.7 15.5 22 16.8 22 18.5Z" stroke="#8B5CF6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-neutral-900">Audio</p>
            <p class="text-xs text-neutral-400 mt-0.5">MP3, m4a</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'select', type: 'photo-video' | 'audio'): void }>()
</script>
