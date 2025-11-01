<script setup lang="ts">
import { NInput } from 'naive-ui'

interface Props {
  modelValue?: string | null
  id?: string
  name?: string
  type?: 'text' | 'password'
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  autofocus?: boolean
  label?: string
  customClass?: string
  showPasswordOn?: 'mousedown' | 'click'
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'medium',
  customClass: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'change', value: string | null): void
}>()

function onUpdate(value: string | null) {
  emit('update:modelValue', value ?? null)
  emit('change', value ?? null)
}
</script>

<template>
  <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">{{ label }}</label>
  <NInput
    class="h-10! rounded-sm!"
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :size="size"
    :class="customClass"
    :show-password-on="showPasswordOn"
    :disabled="disabled"
    :autofocus="autofocus"
    @update:value="onUpdate"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<style scoped></style>
