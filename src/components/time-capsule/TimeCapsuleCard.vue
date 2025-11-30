<template>
  <div
    class="w-full max-w-md bg-white rounded-lg px-3 py-4 shadow-sm border border-gray-100 cursor-pointer"
    @click="handleClick"
  >
    <!-- Header with logo and menu -->
    <div class="flex items-center justify-between mb-4">
      <div class="w-12 h-12 rounded-full flex items-center justify-center">
        <img src="@/assets/svg/capsule-card-icon.svg" alt="Capsule Card Icon" class="w-8 h-8" />
      </div>
      <n-dropdown :options="options" @select="handleSelect" class="z-10!">
        <n-button text type="tertiary" @click.stop.prevent="(e) => e?.stopPropagation()">
          <MlbIcon name="vuesax.linear.more" :size="20" color="#737373" />
        </n-button>
      </n-dropdown>
    </div>

    <!-- Title -->
    <h1 class="text-sm font-medium text-gray-900 mb-6">{{ capsule.title }}</h1>

    <!-- Date and Members Section -->
    <div class="flex justify-end mt-3">
      <!-- Date -->
      <span class="text-gray-600 text-xs font-medium">{{ formatDate(capsule.open_date) }}</span>
    </div>
    <hr class="my-3 border-gray-200" />

    <!-- Avatars with overflow -->
    <div class="flex justify-end items-center gap-2">
      <div class="flex -space-x-2">
        <div
          v-for="(member, index) in visibleMembers"
          :key="index"
          class="w-9 h-9 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center overflow-hidden"
          :title="`${member.first_name} ${member.family_name}`"
        >
          <img
            :src="String(member.profile_picture_url || '')"
            :alt="`${member.first_name} ${member.family_name}`"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Overflow indicator -->
      <div
        v-if="overflowCount > 0"
        class="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700"
      >
        +{{ overflowCount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NDropdown } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { computed, h, ref } from 'vue'
import type { TimeCapsule } from '@/types/time-capsule.types'

interface Props {
  capsule: TimeCapsule
  maxVisibleMembers?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleMembers: 5,
})

const $emit = defineEmits<{
  (e: 'select:option', value: { capsule: TimeCapsule; key: string }): void
}>()

const $router = useRouter()

const visibleMembers = computed(() => {
  return props.capsule.family_members!.slice(0, props.maxVisibleMembers)
})
const overflowCount = computed(() => {
  return Math.max(0, props.capsule.family_members!.length - props.maxVisibleMembers!)
})

const options = [
  {
    label: 'Edit',
    key: 'edit',
    icon: () => h(MlbIcon, { name: 'vuesax.linear.edit-2', size: 12, color: '#737373' }),
  },
  {
    label: 'Delete',
    key: 'delete',
    icon: () => h(MlbIcon, { name: 'delete', size: 12, color: '#C20000' }),
  },
]

const handleSelect = (key: string) => {
  const action = {
    edit: () => $router.push({ name: 'App.TimeCapsules.Edit', params: { id: props.capsule.id } }),
    delete: () =>
      $router.push({ name: 'App.TimeCapsules.Delete', params: { id: props.capsule.id } }),
  }
  action[key as keyof typeof action]()
  $emit('select:option', { capsule: props.capsule, key })
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const handleClick = () => {
  $emit('select:option', { capsule: props.capsule, key: 'view' })
  $router.push({ name: 'App.TimeCapsules.Details', params: { id: props.capsule.id } })
}
</script>
