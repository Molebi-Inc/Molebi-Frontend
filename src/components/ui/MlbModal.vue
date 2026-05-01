<template>
  <div>
    <n-modal v-if="!bottomSheet" v-model:show="localShow" v-bind="attrs" :content-scrollable="true"
      @update:show="emit('close')" @mask-click="emit('mask-click')">
      <n-card :style="cardStyle" :bordered="false" :size="fullPage ? undefined : 'huge'"
        :class="{ 'full-page-card': fullPage }" role="dialog" aria-modal="true" :header-style="headerStyle"
        :header-class="headerClass">
        <template v-if="!headerless && hasHeader" #header>
          <slot name="header" />
        </template>
        <slot />
        <template v-if="hasFooter" #footer>
          <slot name="footer" />
        </template>
      </n-card>
    </n-modal>

    <n-drawer v-if="bottomSheet" v-model:show="localShow" placement="bottom" class="rounded-t-3xl!"
      :height="bottomSheetHeight">
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
import { computed, useAttrs, useSlots, watch, onBeforeUnmount } from 'vue'
import { NModal, NCard, NDrawer, NDrawerContent } from 'naive-ui'
import type { CSSProperties } from 'vue'

const props = withDefaults(
  defineProps<{
    maxWidth?: number
    show?: boolean
    fullPage?: boolean
    bottomSheet?: boolean
    bottomSheetHeight?: number
    bottomSheetFooterClass?: string
    /**
     * When true, hides the `#header` region even if a `header` slot is provided.
     * Useful for truly headerless modals.
     */
    headerless?: boolean
    headerStyle?: CSSProperties
    headerClass?: string
  }>(),
  {
    maxWidth: 600,
    bottomSheetHeight: 306,
    headerless: false,
  },
)

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
  (e: 'mask-click'): void
}>()

const attrs = useAttrs()
const slots = useSlots()

const headerless = computed(() => Boolean(props.headerless))

const hasHeader = computed(() => Boolean(slots.header))
const hasFooter = computed(() => Boolean(slots.footer))

const localShow = computed({
  get: () => props.show ?? false,
  set: (value: boolean) => emit('update:show', value),
})

let ownsLock = false

const lockRootScroll = () => {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  const body = document.body
  if (ownsLock) return

  const currentCount = Number.parseInt(body.dataset.mlbModalLockCount ?? '0', 10) || 0
  if (currentCount === 0) {
    const scrollY = window.scrollY || window.pageYOffset || 0
    body.dataset.mlbModalScrollY = String(scrollY)
    body.dataset.mlbModalScrollLocked = 'true'

    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
  }

  body.dataset.mlbModalLockCount = String(currentCount + 1)
  ownsLock = true
}

const unlockRootScroll = () => {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  const body = document.body
  if (!ownsLock) return

  const currentCount = Number.parseInt(body.dataset.mlbModalLockCount ?? '0', 10) || 0
  const nextCount = Math.max(0, currentCount - 1)
  body.dataset.mlbModalLockCount = String(nextCount)
  ownsLock = false

  if (nextCount > 0) return

  const lockedScrollY = Number.parseInt(body.dataset.mlbModalScrollY ?? '0', 10) || 0
  html.style.overflow = ''
  html.style.overscrollBehavior = ''
  body.style.overflow = ''
  body.style.overscrollBehavior = ''
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  delete body.dataset.mlbModalScrollLocked
  delete body.dataset.mlbModalScrollY
  delete body.dataset.mlbModalLockCount

  window.scrollTo(0, lockedScrollY)
}

watch(
  () => localShow.value,
  (isOpen) => {
    if (isOpen) lockRootScroll()
    else unlockRootScroll()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unlockRootScroll()
})

const cardStyle = computed(() => {
  if (props.fullPage) {
    return { width: '100vw', maxWidth: '100vw', height: '100%' }
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
  return { width: '90%', maxWidth: props.maxWidth + 'px' }
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
