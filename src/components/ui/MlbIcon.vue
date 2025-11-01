<template>
  <img :src="iconSrc" :alt="name" class="w-6 h-6" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: string }>()

// Use import.meta.glob to handle dynamic imports properly
const iconModules = import.meta.glob('/src/assets/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const iconSrc = computed(() => {
  const path = `/src/assets/icons/${props.name}.svg`
  return (iconModules[path] as string) || ''
})
</script>
