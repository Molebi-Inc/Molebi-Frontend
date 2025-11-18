<template>
  <MlbModal v-model:show="showConfirmationModal" class="rounded-3xl! p-8!">
    <template #header>
      <div>
        <BackButton icon="vuesax.linear.arrow-left" class="mb-6" />
      </div>
    </template>
    <MlbIcon v-if="icon" :name="icon" :color="iconColor" :size="iconSize" />
    <h1 class="text-2xl font-bold text-gray-900 text-center mb-4">{{ title }}</h1>
    <p class="text-neutral-600 font-normal text-sm text-center mb-6">{{ description }}</p>
    <slot name="content" />
    <template #footer>
      <div class="flex justify-space-evenly gap-2">
        <div v-if="cancelButtonLabel" class="w-full">
          <n-button
            :block="!confirmButtonLabel"
            :class="['rounded-2xl! h-13! w-full!', cancelButtonClass]"
            @click="handleCancel"
          >
            {{ cancelButtonLabel }}
          </n-button>
        </div>
        <div v-if="confirmButtonLabel" class="w-full">
          <n-button
            :label="confirmButtonLabel"
            :block="!cancelButtonLabel"
            :class="['rounded-2xl! h-13! w-full!', confirmButtonClass]"
            @click="handleConfirm"
          >
            {{ confirmButtonLabel }}
          </n-button>
        </div>
      </div>
    </template>
  </MlbModal>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'

const $emit = defineEmits<{
  (e: 'update:show-confirmation-modal', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const props = withDefaults(
  defineProps<{
    icon?: string
    iconColor?: string
    iconSize?: number
    title: string
    description: string
    confirmButtonLabel: string
    cancelButtonLabel?: string
    cancelButtonClass?: string
    confirmButtonClass?: string
    showModal: boolean
  }>(),
  {
    title: 'Confirmation',
    description: 'Are you sure you want to confirm this action?',
    confirmButtonLabel: '',
    cancelButtonLabel: '',
  },
)

const showConfirmationModal = computed(() => props.showModal)

const handleCancel = () => {
  $emit('cancel')
  $emit('update:show-confirmation-modal', false)
}

const handleConfirm = () => {
  $emit('confirm')
  $emit('update:show-confirmation-modal', false)
}
</script>
