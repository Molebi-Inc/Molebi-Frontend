<template>
  <div class="px-5 py-4">
    <button
      class="flex items-center justify-between w-full text-left"
      @click="$emit('toggle')"
    >
      <span class="font-semibold text-neutral-900 text-sm">{{ title }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-4 h-4 text-neutral-500 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      >
        <path
          fill-rule="evenodd"
          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <Transition name="expand">
      <div v-if="open">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  open: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 400px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
