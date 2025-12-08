<script setup lang="ts">
import { NButton } from 'naive-ui'

interface Props {
  label?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  size?: 'tiny' | 'small' | 'medium' | 'large'
  secondary?: boolean
  loading?: boolean
  primary?: boolean
  text?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  size: 'medium',
  loading: false,
  primary: false,
  text: false,
})
</script>

<template>
  <NButton
    :attr-type="type"
    :disabled="disabled"
    :size="size"
    :tertiary="secondary"
    :text="text"
    :loading="loading"
    :class="[primary ? 'bg-primary-700! text-white! hover:bg-primary-800' : '']"
  >
    <slot name="icon" />
    <span v-if="label">{{ label }}</span>
    <slot />
  </NButton>
</template>

<style scoped></style>
