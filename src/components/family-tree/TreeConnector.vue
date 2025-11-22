<template>
  <svg
    class="tree-connector absolute top-0 left-0 w-full h-full pointer-events-none"
    :style="{ width: `${svgWidth}px`, height: `${svgHeight}px` }"
  >
    <defs>
      <!-- Gradient for parent-child connections -->
      <linearGradient
        v-for="(gradient, index) in gradients"
        :key="`gradient-${index}`"
        :id="`gradient-${index}`"
        :x1="gradient.x1"
        :y1="gradient.y1"
        :x2="gradient.x2"
        :y2="gradient.y2"
      >
        <stop offset="0%" :stop-color="gradient.color" stop-opacity="0.8" />
        <stop offset="100%" :stop-color="gradient.color" stop-opacity="0.4" />
      </linearGradient>
    </defs>

    <!-- Render all connections -->
    <g v-for="(connection, index) in connections" :key="`connection-${index}`">
      <path
        :d="getConnectionPath(connection)"
        :stroke="connection.color"
        :stroke-width="getStrokeWidth(connection.type)"
        fill="none"
        :stroke-linecap="connection.type === 'spouse' ? 'round' : 'butt'"
        :stroke-dasharray="connection.type === 'spouse' ? '5,5' : '0'"
        :opacity="connection.type === 'spouse' ? 0.6 : 0.8"
        class="transition-opacity duration-300"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeConnection } from '@/types/family-tree.types'
import { getConnectionPath as getPath } from '@/helpers/family-tree.helpers'

interface Props {
  connections: TreeConnection[]
  svgWidth?: number
  svgHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  svgWidth: 2000,
  svgHeight: 2000,
})

const getConnectionPath = (connection: TreeConnection): string => {
  return getPath(connection.from, connection.to, connection.type)
}

const getStrokeWidth = (type: 'parent-child' | 'spouse' | 'sibling'): number => {
  const widths = {
    'parent-child': 3,
    spouse: 2,
    sibling: 2,
  }
  return widths[type] || 2
}

const gradients = computed(() => {
  // Create gradients for visual appeal
  return props.connections
    .filter((conn) => conn.type === 'parent-child')
    .map((conn, index) => ({
      id: index,
      x1: conn.from.x,
      y1: conn.from.y,
      x2: conn.to.x,
      y2: conn.to.y,
      color: conn.color,
    }))
})
</script>

<style scoped>
.tree-connector {
  z-index: 0;
}
</style>
