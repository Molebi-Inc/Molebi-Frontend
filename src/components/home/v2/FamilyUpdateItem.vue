<script setup lang="ts">
import { ref, h } from 'vue'
import { NDropdown, NButton } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
import type { Announcement } from '@/types/announcement.types'

const props = defineProps<{ item: Announcement }>()
const emit = defineEmits<{
  (e: 'edit', item: Announcement): void
  (e: 'delete', id: number): void
}>()

const showDropdown = ref(false)

const priorityConfig: Record<string, { dot: string; text: string }> = {
  high: { dot: 'bg-red-500', text: 'text-red-500' },
  medium: { dot: 'bg-yellow-500', text: 'text-yellow-600' },
  low: { dot: 'bg-blue-500', text: 'text-blue-500' },
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

const menuOptions = [
  {
    label: 'Edit & Resend',
    key: 'edit',
    icon: () => h(MlbIcon, { name: 'vuesax.linear.edit-2', size: 14, color: '#737373' }),
  },
  {
    label: 'Delete',
    key: 'delete',
    icon: () => h(MlbIcon, { name: 'delete', size: 14, color: '#C20000' }),
  },
]

const handleMenuSelect = (key: string) => {
  showDropdown.value = false
  if (key === 'edit') emit('edit', props.item)
  if (key === 'delete') emit('delete', props.item.id)
}
</script>

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <!-- Priority badge + three-dot menu -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-1.5">
        <span
          :class="['w-2 h-2 rounded-full flex-shrink-0', priorityConfig[item.priority]?.dot ?? 'bg-neutral-400']"
        />
        <span
          :class="['text-xs font-semibold capitalize', priorityConfig[item.priority]?.text ?? 'text-neutral-500']"
        >
          {{ item.priority }}
        </span>
      </div>
      <NDropdown
        :show="showDropdown"
        :options="menuOptions"
        @select="handleMenuSelect"
        @clickoutside="showDropdown = false"
      >
        <NButton text @click.stop="showDropdown = !showDropdown">
          <MlbIcon
            name="vuesax.linear.more"
            :size="20"
            color="#737373"
            style="transform: rotate(90deg)"
          />
        </NButton>
      </NDropdown>
    </div>

    <!-- Title + date -->
    <h3 class="text-base font-bold text-neutral-900 mb-0.5">{{ item.title }}</h3>
    <p class="text-xs text-neutral-400 mb-2">{{ formatDate(item.created_at) }}</p>

    <!-- Content -->
    <p class="text-sm text-neutral-700 leading-relaxed line-clamp-2">{{ item.content }}</p>

    <hr class="my-3 border-neutral-100" />

    <!-- Engagement row -->
    <div class="flex items-center justify-between gap-2">
      <!-- Like + Comment -->
      <div class="flex items-center gap-4">
        <button
          class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-red-500 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
          <span>Like</span>
        </button>
        <button
          class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-700 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Comment</span>
        </button>
      </div>

      <!-- Avatars + counts -->
      <div class="flex items-center gap-2 min-w-0">
        <MlbAvatar
          v-if="item.members.length"
          :options="{
            firstname_field: 'first_name',
            lastname_field: 'last_name',
            src_field: 'avatar',
            users: item.members,
          }"
          :max="3"
          :size="24"
        />
        <span class="text-xs text-neutral-400 whitespace-nowrap">
          {{ item.view_count }} Views · {{ item.members.length }} Members
        </span>
      </div>
    </div>
  </div>
</template>
