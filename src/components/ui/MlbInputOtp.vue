<script setup lang="ts">
import { NInputOtp } from 'naive-ui'

interface Props {
  modelValue?: string | number | string[] | number[]
  name?: string
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  length?: number
  gap?: number
  block?: boolean
  label?: string
  mask?: string
  customClass?: string
  showPasswordOn?: 'mousedown' | 'click'
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  customClass: '',
  length: 4,
  gap: 10,
  mask: '####',
  block: false,
})

const emit = defineEmits<{
  (e: 'finish', value: string | number | null): void
  (e: 'update:modelValue', value: string | number | null): void
}>()

function onFinish(value: string | number | null) {
  emit('finish', value ?? '')
}
</script>

<template>
  <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">{{ label }}</label>
  <NInputOtp
    class="h-10! rounded-sm!"
    :value="modelValue"
    :mask="mask"
    :size="size"
    :gap="gap"
    :length="length"
    :block="block"
    :class="customClass"
    :on-finish="onFinish"
    @update:value="emit('update:modelValue', $event)"
  />
</template>
