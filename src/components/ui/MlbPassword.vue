<script setup lang="ts">
import { NInput } from 'naive-ui'

interface Props {
  modelValue?: string
  id?: string
  name?: string
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  toggleMask?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  toggleMask: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'change', value: string | null): void
}>()

function onUpdate(value: string | null) {
  emit('update:modelValue', value ?? '')
  emit('change', value ?? '')
}
</script>

<template>
  <NInput
    :value="modelValue as any"
    type="password"
    :placeholder="placeholder"
    :size="size"
    :input-props="{ id, name }"
    :disabled="disabled"
    :show-password-on="toggleMask ? 'click' : undefined"
    @update:value="onUpdate"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <template #password-invisible-icon>
      <span class="i-mdi-eye-off"></span>
    </template>
    <template #password-visible-icon>
      <span class="i-mdi-eye"></span>
    </template>
  </NInput>
</template>

<style scoped></style>


