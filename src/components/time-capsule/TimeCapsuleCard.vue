<template>
  <div
    class="w-full max-w-md bg-white rounded-lg px-3 py-4 hover:shadow-sm border border-gray-100 cursor-pointer"
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
      <span class="text-gray-600 text-xs font-medium">{{ formatDate(capsule.open_at) }}</span>
    </div>
    <!-- <hr class="my-3 border-gray-200" /> -->

    <!-- Avatars with overflow -->
    <!-- <div class="flex justify-end items-center gap-2">
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

      <div
        v-if="overflowCount > 0"
        class="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700"
      >
        +{{ overflowCount }}
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NDropdown } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import type { TimeCapsuleInterface } from '@/types/time-capsule.types'
import { AlertService } from '@/services/alert.service'
import { useDeleteTimeCapsuleMutation } from '@/services/time-capsule.services'
import { handleApiError } from '@/helpers/error.helpers'
import { useMessage } from 'naive-ui'

interface Props {
  capsule: TimeCapsuleInterface
  maxVisibleMembers?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleMembers: 5,
})
const deleteTimeCapsuleMutation = useDeleteTimeCapsuleMutation()
const $emit = defineEmits<{
  (e: 'select:option', value: { capsule: TimeCapsuleInterface; key: string }): void
}>()

const $router = useRouter()
const message = useMessage()
const loading = ref(false)

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
    delete: async () => await handleDelete(),
  }
  action[key as keyof typeof action]()
  $emit('select:option', { capsule: props.capsule, key })
}

const handleDelete = async () => {
  AlertService.confirm({
    subject: `Confirm you want delete "${props.capsule.title}"?`,
    showIcon: true,
    iconName: 'delete',
    iconColor: '#C20000',
    iconWrapperClass:
      'bg-[#FFECEC]! rounded-full! p-3! w-[79px]! h-[79px]! flex items-center justify-center!',
    iconSize: 34,
    closable: true,
    closablePosition: 'left',
    showCancelButton: false,
    confirmButtonText: 'Delete',
    buttonConfig: {
      confirm: {
        text: 'Delete',
        primary: false,
        loading: loading.value,
        action: async () => {
          loading.value = true
          await deleteTimeCapsule()
        },
      },
    },
    customClass: {
      confirmButton:
        'bg-red-200! text-red-500! hover:bg-red-300! hover:text-red-700! h-13! rounded-2xl! hover:border-transparent!',
    },
  })
}

const deleteTimeCapsule = async () => {
  try {
    const response = await deleteTimeCapsuleMutation.mutateAsync(Number(props.capsule.id))
    message.success(response?.message || 'Time capsule deleted successfully')
    $emit('select:option', { capsule: props.capsule, key: 'delete' })
  } catch (error) {
    handleApiError(error, message)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string | Date) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
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
