<script setup lang="ts">
interface Props {
  severity?: 'info' | 'success' | 'warning' | 'error'
  size?: 'small' | 'medium'
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'info',
  size: 'small',
})

const severityToClasses: Record<string, string> = {
  info: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-700',
  error: 'text-red-600',
}
</script>

<template>
  <p :class="['font-normal', size === 'small' ? 'text-sm' : 'text-base', severityToClasses[severity]]">
    <slot />
  </p>
</template>

<style scoped></style>


