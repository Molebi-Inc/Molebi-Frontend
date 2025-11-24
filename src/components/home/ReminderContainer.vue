<template>
  <h3
    id="home-tour-step-4"
    class="text-gray-400 text-sm font-semibold uppercase mb-4 tracking-wider"
  >
    Reminders
  </h3>
  <div v-if="reminders.length > 0" class="relative overflow-auto">
    <!-- Left Scroll Button -->
    <button
      v-if="canScrollLeft"
      @click="scrollReminders('left')"
      class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      aria-label="Scroll left"
    >
      <MlbIcon name="vuesax.linear.arrow-left" class="w-5 h-5 text-gray-700" />
    </button>

    <!-- Scrollable Container -->
    <div
      ref="remindersContainer"
      class="overflow-x-auto pb-4 mx-auto"
      :style="{ width: remindersContainerWidth }"
      style="scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9"
      @scroll="updateScrollButtons"
    >
      <div class="flex gap-4" :style="{ width: `${totalItemsWidth}px` }">
        <ReminderCard v-for="reminder in reminders" :key="reminder.id" :reminder="reminder" />
      </div>
    </div>

    <!-- Right Scroll Button -->
    <button
      v-if="canScrollRight"
      @click="scrollReminders('right')"
      class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      aria-label="Scroll right"
    >
      <MlbIcon name="vuesax.linear.arrow-left" class="w-5 h-5 text-gray-700 rotate-180" />
    </button>
  </div>
  <div v-else class="flex justify-center items-center h-full">
    <p class="text-gray-300 text-sm font-medium mb-4">
      No reminders yet, Your reminders will appear here
    </p>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import ReminderCard from '@/components/home/ReminderCard.vue'
import type { Reminder } from '@/types/reminder.types'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

const isLargeScreen = useMediaQuery('(min-width: 768px)')

const props = defineProps<{
  reminders: Reminder[]
}>()

const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const remindersContainer = ref<HTMLElement | null>(null)

// Calculate visible container width based on screen size (shows 2 on small, 7 on large)
const remindersContainerWidth = computed(() => {
  const itemWidth = 160 // w-40 = 10rem = 160px
  const gap = 16 // gap-4 = 1rem = 16px
  const itemsToShow = isLargeScreen.value ? 7 : 2
  const totalWidth = itemsToShow * itemWidth + (itemsToShow - 1) * gap
  return `${totalWidth}px`
})

// Calculate total width needed for all items
const totalItemsWidth = computed(() => {
  const itemWidth = 160 // w-40
  const gap = 16 // gap-4
  const totalWidth = props.reminders.length * itemWidth + (props.reminders.length - 1) * gap
  return totalWidth
})
const scrollReminders = (direction: 'left' | 'right') => {
  if (!remindersContainer.value) return

  const currentScroll = remindersContainer.value.scrollLeft
  const scrollTo =
    direction === 'left' ? currentScroll - scrollAmount.value : currentScroll + scrollAmount.value

  remindersContainer.value.scrollTo({
    left: scrollTo,
    behavior: 'smooth',
  })
}

// Scroll amount per click (one item width + gap)
const scrollAmount = computed(() => {
  const itemWidth = 160 // w-40
  const gap = 16 // gap-4
  return itemWidth + gap
})

const updateScrollButtons = () => {
  if (!remindersContainer.value) return

  const { scrollLeft, scrollWidth, clientWidth } = remindersContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
}

onMounted(() => {
  // Use nextTick to ensure DOM is fully rendered
  setTimeout(() => {
    updateScrollButtons()
    window.addEventListener('resize', updateScrollButtons)
    if (remindersContainer.value) {
      remindersContainer.value.addEventListener('scroll', updateScrollButtons)
    }
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollButtons)
  if (remindersContainer.value) {
    remindersContainer.value.removeEventListener('scroll', updateScrollButtons)
  }
})

watch(isLargeScreen, () => {
  // Update scroll buttons when screen size changes
  setTimeout(updateScrollButtons, 100)
})
</script>
