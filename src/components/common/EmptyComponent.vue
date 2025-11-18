<template>
  <div class="flex flex-col items-center justify-center">
    <MlbIcon :name="icon" :size="iconSize" :color="iconColor" />
    <h3 v-if="title" class="text-lg text-gray-500 font-medium text-center">{{ title }}</h3>
    <p v-if="description" class="text-gray-500 text-center text-sm">{{ description }}</p>
  </div>
</template>
<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'

withDefaults(
  defineProps<{
    icon: string
    iconSize?: number
    iconColor?: string
    title: string
    description?: string
  }>(),
  {
    icon: 'vuesax.linear.security-time',
    iconClass: '',
    iconColor: '#A1A1A1',
    title: 'Nothing to see here yet',
    description: '',
  },
)
</script>
