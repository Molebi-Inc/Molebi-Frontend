<template>
  <span :style="iconStyle" aria-hidden="true" />
  <!-- <span v-if="iconUrl" :style="iconStyle" aria-hidden="true" />
  <img v-else :src="fallbackSrc" :alt="name" :width="sizeValue" :height="sizeValue" /> -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
// import { resolveIconUrl } from '../../helpers/icon.helpers'

const props = defineProps<{ name: string; color?: string; size?: number | string }>()

// Use import.meta.glob to handle dynamic imports properly
// const iconUrl = computed(() => resolveIconUrl(props.name))
const fallbackSrc = computed(
  () => `/src/assets/icons/${props.name.endsWith('.svg') ? props.name : props.name + '.svg'}`,
)

const sizeValue = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`
  return props.size || '24px'
})

const iconStyle = computed(() => ({
  display: 'inline-block',
  width: sizeValue.value,
  height: sizeValue.value,
  backgroundColor: props.color || 'currentColor',
  WebkitMaskImage: `url(${fallbackSrc.value})`,
  maskImage: `url(${fallbackSrc.value})`,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
}))
</script>
