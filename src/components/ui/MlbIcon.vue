<template>
  <svg :style="iconStyle" aria-hidden="true">
    <use :href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: string; color?: string; size?: number | string }>()

const sizeValue = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`
  return props.size || '24px'
})

const normalizedName = computed(() => props.name.replace(/\.svg$/i, ''))

const symbolId = computed(() => `#mlb-${normalizedName.value}`)

const iconStyle = computed(() => ({
  display: 'inline-block',
  width: sizeValue.value,
  height: sizeValue.value,
  fill: props.color || 'currentColor',
  stroke: props.color || 'currentColor',
}))
</script>
