<template>
  <div
    :class="[
      'bg-white rounded-2xl shadow-lg border border-gray-100',
      isMobile ? 'w-full h-full' : 'w-[360px] max-h-[520px]',
      'flex flex-col overflow-hidden',
    ]"
  >
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <p class="text-base font-semibold text-gray-900">Notifications</p>
      <span class="text-xs text-gray-400">{{ notifications?.length ?? 0 }}</span>
    </div>
    <div class="flex-1 overflow-y-auto px-2 py-2 space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="rounded-2xl border border-gray-100 bg-white px-3 py-3 flex gap-3 items-start shadow-sm"
      >
        <div
          class="h-10 w-10 rounded-full flex items-center justify-center"
          :class="iconBgClass(notification.type)"
        >
          <MlbIcon :name="iconName(notification.type)" :size="20" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">
                {{ notification.title }}
              </p>
              <p class="text-xs text-gray-500 leading-snug">
                {{ notification.message }}
              </p>
            </div>
            <span class="text-[11px] text-gray-400 whitespace-nowrap">
              {{ notification.timeAgo }}
            </span>
          </div>
          <div
            v-if="notification.actions && notification.actions.length"
            class="flex items-center gap-4 mt-2 text-xs font-medium"
          >
            <button
              v-for="action in notification.actions"
              :key="action.label"
              type="button"
              class="underline"
              :class="action.approve ? 'text-green-600' : 'text-red-500'"
              @click="action.onClick && action.onClick(notification)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="!notifications || !notifications.length"
        class="py-6 text-center text-sm text-gray-500"
      >
        No notifications yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'
import type { NotificationItem, NotificationType } from '@/types/general.types'

defineProps<{
  notifications: NotificationItem[]
  isMobile?: boolean
}>()

const iconName = (type?: NotificationType) => {
  switch (type) {
    case 'branch':
      return 'vuesax.linear.cloud-add'
    case 'connection':
      return 'vuesax.linear.user-add'
    case 'memory':
      return 'vuesax.linear.image'
    case 'birthday':
      return 'vuesax.linear.cake'
    case 'update':
      return 'vuesax.linear.activity'
    default:
      return 'vuesax.linear.notification'
  }
}

const iconBgClass = (type?: NotificationType) => {
  switch (type) {
    case 'branch':
    case 'update':
      return 'bg-green-50 text-green-700'
    case 'connection':
      return 'bg-blue-50 text-blue-600'
    case 'memory':
      return 'bg-purple-50 text-purple-600'
    case 'birthday':
      return 'bg-amber-50 text-amber-600'
    default:
      return 'bg-gray-50 text-gray-500'
  }
}
</script>

<style scoped>
.shadow-lg {
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08);
}
</style>
