<template>
  <div :class="[
    'flex items-center gap-3 px-4 py-3 rounded-2xl bg-transparent border border-white/10',
    disabled ? 'opacity-60' : '',
    wrapperClass,
  ]">
    <button type="button" class="text-white/70 hover:text-white transition-colors shrink-0" :disabled="disabled"
      :aria-label="emojiAriaLabel" @click="$emit('emoji')">
      <span class="text-base leading-none">{{ emoji }}</span>
    </button>

    <input :value="modelValue" type="text" :placeholder="placeholder" :disabled="disabled"
      class="flex-1 bg-transparent outline-none text-gray-600 placeholder:text-gray-600 text-sm min-w-0"
      @input="onInput" @keydown.enter.prevent="onSend()" />

    <button type="button"
      class="w-9 h-9 rounded-xl bg-transparent  hover:bg-gray-700 transition-colors flex items-center justify-center shrink-0 disabled:opacity-60"
      :disabled="disabled || sending || !modelValue.trim()" :aria-label="sendAriaLabel" @click="onSend()">
      <svg v-if="sending" width="16" height="16" viewBox="0 0 16 16" fill="none" class="animate-spin text-primary-800">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" />
        <path d="M14 8a6 6 0 0 1-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <MlbIcon v-else :name="sendIcon" :size="16" color="#034E03" />
    </button>
  </div>
</template>

<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    disabled?: boolean
    sending?: boolean
    wrapperClass?: string
    emoji?: string
    sendIcon?: string
    emojiAriaLabel?: string
    sendAriaLabel?: string
    clearOnSend?: boolean
  }>(),
  {
    placeholder: 'Add a comment...',
    disabled: false,
    sending: false,
    wrapperClass: '',
    sendIcon: 'send-fill',
    emojiAriaLabel: 'Open emoji picker',
    sendAriaLabel: 'Send',
    clearOnSend: true,
    emoji: '😊',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send', value: string): void
  (e: 'emoji'): void
}>()

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null
  emit('update:modelValue', target?.value ?? '')
}

const onSend = () => {
  const value = props.modelValue.trim()
  if (!value || props.disabled || props.sending) return
  emit('send', value)
  if (props.clearOnSend) emit('update:modelValue', '')
}
</script>
