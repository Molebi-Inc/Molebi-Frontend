<template>
  <img :src="iconSrc" :alt="name" class="w-6 h-6" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: string }>()

const iconSrc = computed(() => {
  return `/src/assets/icons/${props.name}.svg`
})
</script>
