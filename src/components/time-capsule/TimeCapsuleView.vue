<template>
  <div class="mx-20">
    <div
      v-if="capsule?.open_date && new Date(capsule.open_date) > new Date()"
      class="flex flex-col items-center mb-12"
    >
      <div class="flex justify-center items-center w-20 h-20 bg-[#FFFDEC] rounded-full mb-4">
        <MlbIcon name="delete" :size="34" color="#C2A100" />
      </div>
      <p class="text-gray-800 font-semibold">Time capsule is not yet available for preview</p>
    </div>
    <div v-else>
      <div class="flex justify-center items-center">
        <h1 class="text-2xl font-bold text-gray-800 text-center mb-14">{{ capsule?.title }}</h1>
      </div>
      <div class="flex flex-col gap-4">
        <p class="text-gray-600 font-normal text-xs">{{ capsule?.description }}</p>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="media in capsule?.media" :key="media.id">
            <img :src="media.url" alt="media" class="w-20 h-20 rounded-xl" />
          </div>
        </div>
        <p class="text-gray-600 font-normal text-xs">{{ capsule?.body }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'
import type { TimeCapsule } from '@/types/time-capsule.types'

defineProps<{
  capsule?: TimeCapsule
}>()
</script>

<style scoped></style>
