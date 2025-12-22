<template>
  <div class="w-full h-full relative">
    <svg :width="width" :height="height" class="overflow-visible">
      <!-- Background -->
      <rect :width="width" :height="height" fill="#f9fafb" rx="4" />

      <!-- Horizontal Chart bars -->
      <g v-if="(men > 0 || women > 0) && direction === 'horizontal'">
        <!-- Men bar -->
        <rect
          :x="barPadding"
          :y="barSpacing"
          :width="menBarWidth"
          :height="barHeight"
          fill="#3b82f6"
          rx="4"
        />

        <!-- Men value label ABOVE bar -->
        <text
          v-if="men > 0"
          :x="barPadding + menBarWidth / 2"
          :y="barSpacing - 4"
          text-anchor="middle"
          dominant-baseline="auto"
          class="text-xs fill-gray-700 font-medium"
        >
          {{ men }}
        </text>

        <!-- Women bar -->
        <rect
          :x="barPadding"
          :y="barSpacing * 2 + barHeight"
          :width="womenBarWidth"
          :height="barHeight"
          fill="#ec4899"
          rx="4"
        />

        <!-- Women value label ABOVE bar -->
        <text
          v-if="women > 0"
          :x="barPadding + womenBarWidth / 2"
          :y="barSpacing * 2 + barHeight - 4"
          text-anchor="middle"
          dominant-baseline="auto"
          class="text-xs fill-gray-700 font-medium"
        >
          {{ women }}
        </text>

        <!-- Y-axis labels (left of bars) -->
        <text
          :x="barPadding - 8"
          :y="barSpacing + barHeight / 2"
          text-anchor="end"
          dominant-baseline="middle"
          class="text-xs fill-gray-600"
        >
          Men
        </text>
        <text
          :x="barPadding - 8"
          :y="barSpacing * 2 + barHeight + barHeight / 2"
          text-anchor="end"
          dominant-baseline="middle"
          class="text-xs fill-gray-600"
        >
          Women
        </text>
      </g>

      <!-- Vertical Chart bars -->
      <g v-if="(men > 0 || women > 0) && direction === 'vertical'">
        <!-- Men bar -->
        <rect
          :x="verticalBarSpacing"
          :y="menBarY"
          :width="verticalBarWidth"
          :height="menBarHeight"
          fill="#3b82f6"
          rx="4"
        />

        <!-- Men value label on bar -->
        <text
          v-if="men > 0"
          :x="verticalBarSpacing + verticalBarWidth / 2"
          :y="menBarY - 4"
          text-anchor="middle"
          dominant-baseline="auto"
          class="text-xs fill-gray-700 font-medium"
        >
          {{ men }}
        </text>

        <!-- Men label below bar -->
        <text
          :x="verticalBarSpacing + verticalBarWidth / 2"
          :y="height - labelPadding"
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-xs fill-gray-600"
        >
          Men
        </text>

        <!-- Women bar -->
        <rect
          :x="verticalBarSpacing * 2 + verticalBarWidth"
          :y="womenBarY"
          :width="verticalBarWidth"
          :height="womenBarHeight"
          fill="#ec4899"
          rx="4"
        />

        <!-- Women value label on bar -->
        <text
          v-if="women > 0"
          :x="verticalBarSpacing * 2 + verticalBarWidth + verticalBarWidth / 2"
          :y="womenBarY - 4"
          text-anchor="middle"
          dominant-baseline="auto"
          class="text-xs fill-gray-700 font-medium"
        >
          {{ women }}
        </text>

        <!-- Women label below bar -->
        <text
          :x="verticalBarSpacing * 2 + verticalBarWidth + verticalBarWidth / 2"
          :y="height - labelPadding"
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-xs fill-gray-600"
        >
          Women
        </text>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  men: number
  women: number
  width?: number
  height?: number
  direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  width: 200,
  height: 60,
  direction: 'horizontal',
})

const direction = computed(() => props.direction)

const maxValue = computed(() => Math.max(props.men, props.women, 1))

// Horizontal chart configuration
const barPadding = computed(() => 50) // Space for y-axis labels
const barSpacing = computed(() => 8) // Space between bars
const barHeight = computed(() => (props.height - barSpacing.value * 3) / 2) // Height of each bar
const chartWidth = computed(() => props.width - barPadding.value - 40) // Available width for bars (40px for value labels)

// Horizontal bar widths
const menBarWidth = computed(() => {
  if (maxValue.value === 0 || direction.value === 'vertical') return 0
  return (props.men / maxValue.value) * chartWidth.value
})

const womenBarWidth = computed(() => {
  if (maxValue.value === 0 || direction.value === 'vertical') return 0
  return (props.women / maxValue.value) * chartWidth.value
})

// Vertical chart configuration
const labelPadding = computed(() => 20) // Space for labels at bottom
const verticalBarSpacing = computed(() => 16) // Space between bars
const verticalBarWidth = computed(() => (props.width - verticalBarSpacing.value * 3) / 2) // Width of each bar
const chartHeight = computed(() => props.height - labelPadding.value - 20) // Available height for bars (20px for value labels at top)

// Vertical bar heights
const menBarHeight = computed(() => {
  if (maxValue.value === 0 || direction.value === 'horizontal') return 0
  return (props.men / maxValue.value) * chartHeight.value
})

const womenBarHeight = computed(() => {
  if (maxValue.value === 0 || direction.value === 'horizontal') return 0
  return (props.women / maxValue.value) * chartHeight.value
})

// Vertical bar Y positions (bars start from bottom)
const menBarY = computed(() => {
  if (direction.value === 'horizontal') return 0
  return props.height - labelPadding.value - menBarHeight.value
})

const womenBarY = computed(() => {
  if (direction.value === 'horizontal') return 0
  return props.height - labelPadding.value - womenBarHeight.value
})
</script>

<style scoped></style>
