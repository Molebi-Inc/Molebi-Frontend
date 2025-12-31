<template>
  <div class="relative h-24 overflow-hidden">
    <div
      class="transition-transform duration-700 ease-in-out"
      :style="{ transform: `translateY(-${activeIndex * itemHeight}px)` }"
    >
      <div v-for="(item, index) in items" :key="index" class="h-24 flex flex-col justify-center">
        <p class="text-sm uppercase text-white mb-1">{{ community }} - {{ item.label }}</p>
        <p class="md:text-base text-sm text-white truncate w-[75%]">
          {{ item.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  data: Record<string, string>
  community: string
}>()

const itemHeight = 96 // h-24 = 96px
const activeIndex = ref(0)
let interval: number

const items = Object.entries(props.data).map(([key, value]) => ({
  label: key.replace(/_/g, ' '),
  value,
}))

onMounted(() => {
  interval = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % items.length
  }, 3000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
