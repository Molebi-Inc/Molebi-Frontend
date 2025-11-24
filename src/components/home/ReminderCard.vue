<template>
  <div
    class="shrink-0 bg-white rounded-lg p-4 w-40 border border-gray-200 hover:shadow-md transition-shadow"
  >
    <h4 class="font-semibold text-gray-900">{{ reminder.title }}</h4>
    <p class="text-xs text-gray-500 mt-2">{{ reminder.date }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Reminder } from '@/types/reminder.types'

defineProps<{
  reminder: Reminder
}>()
</script>
