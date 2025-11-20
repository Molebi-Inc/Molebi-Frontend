<script setup lang="ts">
import { NInput } from 'naive-ui'
import { useAttrs, computed } from 'vue'

interface Props {
  modelValue?: string | null
  id?: string
  name?: string
  type?: 'text' | 'password' | 'textarea'
  round?: boolean
  borderless?: boolean
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  autofocus?: boolean
  label?: string
  customClass?: string
  showPasswordOn?: 'mousedown' | 'click'
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'medium',
  customClass: '',
  round: false,
  rows: 4,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'change', value: string | null): void
}>()

const attrs = useAttrs()
const borderlessClasses =
  'border-none! focus:border-none! focus:ring-0! focus:outline-none! !shadow-none!'

const classes = computed(() => {
  return [props.customClass, 'mlb-input', props.borderless ? borderlessClasses : attrs.class]
})

const onUpdate = (value: string | null) => {
  emit('update:modelValue', value ?? null)
  emit('change', value ?? null)
}
</script>

<template>
  <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">{{ label }}</label>
  <NInput
    :class="classes"
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :size="size"
    :round="round"
    :show-password-on="showPasswordOn"
    :disabled="disabled"
    :autofocus="autofocus"
    :rows="rows"
    @update:value="onUpdate"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
  </NInput>
</template>

<style scoped></style>
