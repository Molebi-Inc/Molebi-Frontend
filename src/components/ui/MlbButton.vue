<script setup lang="ts">
import { NButton } from 'naive-ui'

interface Props {
  label?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  size?: 'tiny' | 'small' | 'medium' | 'large'
  secondary?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  size: 'medium',
})
</script>

<template>
  <NButton :type="type" :disabled="disabled" :size="size" :tertiary="secondary">
    <slot name="icon" />
    <span v-if="label">{{ label }}</span>
    <slot />
  </NButton>
  <!-- Apply Tailwind classes from parent as needed. -->
</template>

<style scoped></style>


