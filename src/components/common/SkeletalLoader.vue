<template>
  <section>
    <div
      class="grid"
      :style="{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`,
      }"
    >
      <n-skeleton
        v-for="i in totalSkeletons"
        :key="i"
        :height="props.height"
        :width="props.width"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { NSkeleton } from 'naive-ui'

interface Props {
  height?: string
  width?: string
  columns?: number
  rows?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: '40px',
  width: '',
  columns: 1,
  rows: 1,
  gap: 1,
})

const totalSkeletons = computed(() => props.columns * props.rows)
</script>
