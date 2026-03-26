<template>
  <NDropdown :options="options" trigger="click" placement="bottom-end" @select="handleSelect">
    <button
      class="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors rotate-90">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="4.5" r="1.4" fill="currentColor" />
        <circle cx="9" cy="9" r="1.4" fill="currentColor" />
        <circle cx="9" cy="13.5" r="1.4" fill="currentColor" />
      </svg>
    </button>
  </NDropdown>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NDropdown } from 'naive-ui'

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'share'): void
  (e: 'tag'): void
  (e: 'delete'): void
}>()

const options = [
  {
    label: 'Edit Details',
    key: 'edit',
    icon: () =>
      h(
        'svg',
        { width: 15, height: 15, viewBox: '0 0 15 15', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
        [
          h('path', {
            d: 'M10.5 2.5L12.5 4.5L5 12L2.5 12.5L3 10L10.5 2.5Z',
            stroke: '#737373',
            'stroke-width': '1.3',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        ],
      ),
  },
  {
    label: 'Share',
    key: 'share',
    icon: () =>
      h(
        'svg',
        { width: 15, height: 15, viewBox: '0 0 15 15', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
        [
          h('path', {
            d: 'M11 2L14 5L11 8M14 5H6C4.3 5 3 6.3 3 8V13',
            stroke: '#737373',
            'stroke-width': '1.3',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        ],
      ),
  },
  {
    label: 'Tag Family Members',
    key: 'tag',
    icon: () =>
      h(
        'svg',
        { width: 15, height: 15, viewBox: '0 0 15 15', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
        [
          h('path', {
            d: 'M2 8L7 2H13V8L8 13L2 8ZM9.5 5.5H9.51',
            stroke: '#737373',
            'stroke-width': '1.3',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        ],
      ),
  },
  { type: 'divider', key: 'd1' },
  {
    label: () => h('span', { style: { color: '#DC2626' } }, 'Delete'),
    key: 'delete',
    icon: () =>
      h(
        'svg',
        { width: 15, height: 15, viewBox: '0 0 15 15', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
        [
          h('path', {
            d: 'M2 4H13M5 4V2H10V4M6 7V11M9 7V11M3 4L3.5 13H11.5L12 4H3Z',
            stroke: '#DC2626',
            'stroke-width': '1.3',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        ],
      ),
  },
]

const handleSelect = (key: string) => {
  if (key === 'edit') emit('edit')
  else if (key === 'share') emit('share')
  else if (key === 'tag') emit('tag')
  else if (key === 'delete') emit('delete')
}
</script>
