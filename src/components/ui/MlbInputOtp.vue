<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { NInputOtp } from 'naive-ui'

interface Props {
  modelValue?: string[] | null
  name?: string
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  length?: number
  gap?: number
  block?: boolean
  label?: string
  mask?: boolean
  customClass?: string
  showPasswordOn?: 'mousedown' | 'click'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  customClass: '',
  length: 4,
  gap: 10,
  mask: true,
  block: false,
})

const isLargeScreen = useMediaQuery('(min-width: 768px)')
const resolvedSize = computed(() => !isLargeScreen.value ? 'large' : props.size)

const emit = defineEmits<{
  (e: 'finish', value: string[] | null): void
  (e: 'update:modelValue', value: string[] | null): void
}>()

function onFinish(value: string[] | null) {
  emit('finish', value)
}
</script>

<template>
  <label v-if="label" :for="name" class="text-sm font-medium text-gray-700">{{ label }}</label>
  <NInputOtp class="otp-input rounded-sm!" :value="modelValue" :mask="mask" :size="resolvedSize"
    :gap="isLargeScreen ? gap : 16" :length="length" :block="block" :class="customClass" :on-finish="onFinish"
    @update:value="emit('update:modelValue', $event)" />
</template>

<style scoped>
/* Default sizing when callers don't apply their own wrapper class styles. */
:deep(.otp-input:not(.otp-input-wrapper) .n-input.n-input--resizable.n-input--stateful) {
  height: 36px !important;
  width: 36px !important;
}

/* Large screens: slightly larger OTP boxes for better readability. */
@media (min-width: 1024px) {
  :deep(.otp-input:not(.otp-input-wrapper) .n-input.n-input--resizable.n-input--stateful) {
    height: 60px !important;
    width: 60px !important;
  }
}

.otp-input :deep(.n-input .n-input-wrapper .n-input__input) {
  display: flex;
  align-items: center;
}

.otp-input :deep(.n-input .n-input-wrapper .n-input__input .n-input__input-el) {
  font-size: 20px;
}
</style>
