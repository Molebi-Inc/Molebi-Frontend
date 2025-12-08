<template>
  <!-- @on-mask-click="emit('on-mask-click')" -->
  <n-modal
    v-model:show="localShow"
    v-bind="attrs"
    @update:show="emit('close')"
    @mask-click="emit('mask-click')"
  >
    <n-card
      :style="cardStyle"
      :bordered="false"
      :size="fullPage ? undefined : 'huge'"
      :class="{ 'full-page-card': fullPage }"
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
import { computed, useAttrs } from 'vue'
import { NModal, NCard } from 'naive-ui'

const props = defineProps<{
  show?: boolean
  fullPage?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
  (e: 'mask-click'): void
}>()

const attrs = useAttrs()
const localShow = computed({
  get: () => props.show ?? false,
  set: (value: boolean) => emit('update:show', value),
})

const cardStyle = computed(() => {
  if (props.fullPage) {
    return { width: '100vw', maxWidth: '100vw', height: '100vh' }
  }
  return { width: '90%', maxWidth: '600px' }
})
</script>

<style scoped>
.full-page-card {
  border-radius: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  margin: 0 !important;
}

:deep(.full-page-card .n-card__content) {
  flex: 1 !important;
  overflow: auto !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
}
</style>
