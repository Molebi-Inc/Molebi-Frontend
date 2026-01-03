<template>
  <div class="bg-white rounded-3xl border border-primary-400 p-4 shadow-sm space-y-4">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-wide text-primary-800 font-semibold">Current Stage</p>
        <h2 class="text-xl font-semibold text-gray-900 mt-0.5">{{ stageTitle }}</h2>
        <p class="text-sm text-gray-600 mt-1">
          {{ description }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs uppercase tracking-wide text-gray-500">Next</p>
        <span class="text-sm font-semibold text-primary-800">{{ nextStage }}</span>
      </div>
    </div>

    <div class="space-y-3">
      <div v-for="task in tasks" :key="task.task" class="space-y-1.5">
        <div class="flex items-center justify-between text-sm text-gray-700 font-medium">
          <div class="flex items-center gap-2">
            <span>{{ task.task }}</span>
          </div>
          <span class="text-gray-500 text-xs font-semibold"
            >{{ task.completion_count }}/{{ task.target_count }}</span
          >
        </div>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :style="{
              width: `${Math.min((task.completion_count / task.target_count) * 100, 100)}%`,
              backgroundColor: '#22C55E',
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProgressItems } from '@/types/general.types'

interface Props {
  stageTitle: string
  nextStage: string
  description: string
  tasks: ProgressItems[]
}

defineProps<Props>()
</script>
