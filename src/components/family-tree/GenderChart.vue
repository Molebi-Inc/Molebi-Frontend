<template>
  <div class="w-full h-full relative">
    <svg :width="width" :height="height" class="overflow-visible">
      <!-- Background -->
      <rect :width="width" :height="height" fill="#f9fafb" rx="4" />

      <!-- Chart lines -->
      <g v-if="men > 0 || women > 0">
        <!-- Men line -->
        <polyline
          :points="menPoints"
          fill="none"
          stroke="#3b82f6"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Women line -->
        <polyline
          :points="womenPoints"
          fill="none"
          stroke="#ec4899"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Men area fill -->
        <polygon
          :points="`0,${height} ${menPoints} ${width},${height}`"
          fill="#3b82f6"
          fill-opacity="0.2"
        />

        <!-- Women area fill -->
        <polygon
          :points="`0,${height} ${womenPoints} ${width},${height}`"
          fill="#ec4899"
          fill-opacity="0.2"
        />

        <!-- Men dots -->
        <circle
          v-for="(point, index) in menDataPoints"
          :key="`men-${index}`"
          :cx="point.x"
          :cy="point.y"
          r="3"
          fill="#3b82f6"
        />

        <!-- Women dots -->
        <circle
          v-for="(point, index) in womenDataPoints"
          :key="`women-${index}`"
          :cx="point.x"
          :cy="point.y"
          r="3"
          fill="#ec4899"
        />
      </g>

      <!-- Empty state -->
      <text
        v-if="men === 0 && women === 0"
        :x="width / 2"
        :y="height / 2"
        text-anchor="middle"
        class="text-xs fill-gray-400"
      >
        No data
      </text>
    </svg>

    <!-- Legend -->
    <div class="flex items-center gap-4 mt-2 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
        <span class="text-gray-600">Men ({{ men }})</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-pink-500"></div>
        <span class="text-gray-600">Women ({{ women }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  men: number
  women: number
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 200,
  height: 60,
})

const total = computed(() => props.men + props.women)

const maxValue = computed(() => Math.max(props.men, props.women, 1))

// Generate data points for the line chart
// Using a simple curve with 5 points for smooth visualization
const dataPoints = computed(() => {
  const points = 5
  const step = props.width / (points - 1)
  return Array.from({ length: points }, (_, i) => i * step)
})

const menDataPoints = computed(() => {
  return dataPoints.value.map((x, index) => {
    // Create a smooth curve that peaks at the men value
    const progress = index / (dataPoints.value.length - 1)
    const y =
      props.height -
      (props.men / maxValue.value) * props.height * (0.5 + 0.5 * Math.sin(progress * Math.PI))
    return { x, y }
  })
})

const womenDataPoints = computed(() => {
  return dataPoints.value.map((x, index) => {
    // Create a smooth curve that peaks at the women value
    const progress = index / (dataPoints.value.length - 1)
    const y =
      props.height -
      (props.women / maxValue.value) * props.height * (0.5 + 0.5 * Math.sin(progress * Math.PI))
    return { x, y }
  })
})

const menPoints = computed(() => {
  return menDataPoints.value.map((p) => `${p.x},${p.y}`).join(' ')
})

const womenPoints = computed(() => {
  return womenDataPoints.value.map((p) => `${p.x},${p.y}`).join(' ')
})
</script>

<style scoped></style>
