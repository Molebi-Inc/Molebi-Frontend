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

    <!-- Render all connections with enhanced visual quality -->
    <g v-for="(connection, index) in connections" :key="`connection-${index}`">
      <!-- Subtle shadow layer for depth (rendered first, behind main line) -->
      <path
        :d="getConnectionPath(connection)"
        :stroke="connection.type === 'parent-child' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)'"
        :stroke-width="getStrokeWidth(connection.type) + 1.5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        :opacity="0.4"
      />
      <!-- Main connection line with enhanced rendering -->
      <path
        :d="getConnectionPath(connection)"
        :stroke="connection.color"
        :stroke-width="getStrokeWidth(connection.type)"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        :opacity="getOpacity(connection.type)"
        class="transition-opacity duration-300"
        vector-effect="non-scaling-stroke"
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
    'parent-child': 4, // Thicker for dark green parent-child lines for better visibility
    spouse: 3, // Medium width for beige spouse connections
    sibling: 3, // Medium width for beige sibling connections
  }
  return widths[type] || 3
}

const getOpacity = (type: 'parent-child' | 'spouse' | 'sibling'): number => {
  const opacities = {
    'parent-child': 0.9, // More opaque for dark green lines for better visibility
    spouse: 0.8, // Good opacity for beige lines
    sibling: 0.8, // Good opacity for beige lines
  }
  return opacities[type] || 0.8
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
