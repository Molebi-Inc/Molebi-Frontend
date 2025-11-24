<template>
  <n-modal v-model:show="localShow" @on-update:show="emit('close')">
    <n-card
      :style="{ width: '90%', maxWidth: '600px' }"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header>
        <slot name="header" />
      </template>
      <slot />
      <template #footer>
        <slot name="footer" />
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NCard } from 'naive-ui'

const props = defineProps<{
  show?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

const localShow = computed({
  get: () => props.show ?? false,
  set: (value: boolean) => emit('update:show', value),
})
</script>
