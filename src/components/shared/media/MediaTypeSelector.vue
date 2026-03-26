<template>
  <div class="px-2 py-2">
    <!-- <p class="text-center text-lg font-medium text-neutral-800 mb-8">Select your memory type</p> -->
    <div class="flex flex-col md:flex-row gap-4">
      <button
        class="flex-1 h-[140px] rounded-2xl bg-white hover:bg-[#EEF3EF] shadow-[0_10px_30px_rgba(15,23,42,0.08)] px-6 flex items-center gap-4 text-left transition-all hover:shadow-[0_12px_34px_rgba(15,23,42,0.12)]"
        @click="$emit('select', 'photo-video')">
        <img src="/src/assets/images/photo-memory.png" alt="Photos and videos"
          class="w-14 h-14 object-contain shrink-0" />
        <div>
          <p class="text-sm leading-[1.05] font-medium text-primary-800">Photos and Videos</p>
          <p class="text-xs leading-[1.1] text-neutral-500 italic mt-1">Jpeg, PNG, Avif...</p>
        </div>
      </button>

      <button
        class="flex-1 h-[140px] rounded-2xl bg-white hover:bg-[#EEF3EF] shadow-[0_10px_30px_rgba(15,23,42,0.06)] px-6 flex items-center gap-4 text-left transition-all hover:shadow-[0_12px_34px_rgba(15,23,42,0.1)]"
        @click="$emit('select', 'audio')">
        <img src="/src/assets/images/audio-memory.png" alt="Audio" class="w-14 h-14 object-contain shrink-0" />
        <div>
          <p class="text-sm leading-[1.05] font-medium text-primary-800">Audio</p>
          <p class="text-xs leading-[1.1] text-neutral-500 italic mt-1">Mp3, AUD...</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'select', type: 'photo-video' | 'audio'): void }>()
</script>
