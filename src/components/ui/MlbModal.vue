<template>
  <div>
    <n-modal
      v-if="!bottomSheet"
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

    <n-drawer
      v-if="bottomSheet"
      v-model:show="localShow"
      placement="bottom"
      class="rounded-t-3xl!"
      :height="bottomSheetHeight"
    >
      <n-drawer-content :footer-class="bottomSheetFooterClass">
        <template #header>
          <slot name="header" />
        </template>
        <slot />
        <template #footer>
          <slot name="footer" />
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NModal, NCard, NDrawer, NDrawerContent } from 'naive-ui'

const props = withDefaults(
  defineProps<{
    show?: boolean
    fullPage?: boolean
    bottomSheet?: boolean
    bottomSheetHeight?: number
    bottomSheetFooterClass?: string
  }>(),
  {
    bottomSheetHeight: 306,
  },
)

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
  if (props.bottomSheet) {
    return {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      width: '100%',
      maxWidth: '100%',
      marginBottom: '0',
      borderBottomLeftRadius: '0',
      borderBottomRightRadius: '0',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
    }
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
