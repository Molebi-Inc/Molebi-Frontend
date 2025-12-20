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
    <div :title="capsule.title" class="text-sm font-medium text-gray-900 mb-6 line-clamp-1">
      {{ capsule.title }}
    </div>

    <!-- Date and Members Section -->
    <div class="flex justify-end mt-3">
      <!-- Date -->
      <span class="text-gray-600 text-xs font-medium">{{ formatDate(capsule.open_at) }}</span>
    </div>

    <!-- Avatars with overflow -->
    <div v-if="capsule.family_members && capsule.family_members.length > 0">
      <hr class="my-3 border-gray-200" />
      <div class="flex justify-end items-center">
        <MlbAvatar
          :options="{
            firstname_field: 'first_name',
            lastname_field: 'family_name',
            src_field: 'profile_picture_url',
            users: capsule.family_members,
          }"
          :max="4"
          :size="32"
        />
      </div>
    </div>
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
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
import { useMediaQuery } from '@vueuse/core'

interface Props {
  capsule: TimeCapsuleInterface
}

const props = withDefaults(defineProps<Props>(), {})
const $emit = defineEmits<{
  (e: 'select:option', value: { capsule: TimeCapsuleInterface; key: string }): void
}>()

const $router = useRouter()
const message = useMessage()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const deleteTimeCapsuleMutation = useDeleteTimeCapsuleMutation()

const loading = ref<boolean>(false)

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
    edit: () =>
      $router.push({
        name: 'App.TimeCapsules.Edit',
        params: { id: props.capsule.id, step: isLargeScreen.value ? undefined : '1' },
      }),
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
