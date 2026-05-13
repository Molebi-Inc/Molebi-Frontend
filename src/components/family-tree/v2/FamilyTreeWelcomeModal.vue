<template>
  <MlbModal :show="show" :max-width="420" :bottom-sheet="isMobile" :bottom-sheet-height="400" :mask-closable="false"
    :borderless="step === 2" @update:show="emit('update:show', $event)" class="rounded-3xl!">
    <template #header>
      <div v-if="step === 1" class="flex items-center justify-between">
        <div></div>
        <h3 class="text-lg font-bold text-neutral-900">Family Tree</h3>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          @click="emit('update:show', false)">
          &times;
        </button>
      </div>
    </template>
    <!-- Step 1: Welcome -->
    <div v-if="step === 1" class="flex flex-col items-center text-center py-2">
      <img src="@/assets/images/family_tree.png" alt="Family Tree" class="w-40 h-40 object-contain mb-5" />
      <h3 class="text-xl font-semibold text-gray-900 mb-6">Welcome to your Family Tree</h3>
      <MlbButton label="Get Started"
        class="px-8! rounded-3xl! bg-primary-700! h-12! text-white! font-semibold! text-base!" @click="step = 2" />
    </div>

    <!-- Step 2: Date of Birth -->
    <div v-else class="flex flex-col py-2">
      <button
        class="self-end w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors mb-4 cursor-pointer"
        @click="emit('update:show', false)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path
            d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
      <div class="text-center mb-6">
        <h3 class="text-xl font-bold text-neutral-900 mb-2">What year were you born?</h3>
        <p class="text-sm text-gray-700">This helps place you correctly in the family timeline</p>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-neutral-700 mb-1">
          Date of Birth <span class="text-red-500">*</span>
        </label>
        <n-date-picker v-model:formatted-value="dob" type="date" :is-date-disabled="dateDisabled"
          placeholder="yyyy-MM-dd" format="yyyy-MM-dd" class="w-full" />
      </div>
      <MlbButton label="Continue" :loading="saving" :disabled="!dob || saving"
        class="px-4! rounded-3xl! bg-primary-700! h-12! text-white! font-semibold! text-base!" @click="onContinue" />
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { NDatePicker, useMessage } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useProfileStore } from '@/stores/profile.store'
import { handleApiError } from '@/helpers/error.helpers'
import { useUpdateProfileMutation } from '@/services/authentication.services'
import { useProfile } from '@/composables/useProfile'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'update:show', value: boolean): void }>()

const message = useMessage()
const profileStore = useProfileStore()
const { getProfile } = useProfile()
const updateProfileMutation = useUpdateProfileMutation()
const isMobile = useMediaQuery('(max-width: 767px)')

const step = ref(1)
const dob = ref<string | null>(null)
const saving = computed(() => updateProfileMutation.isPending.value)

const dateDisabled = (ts: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(ts) > today
}

const onContinue = async () => {
  if (!dob.value) return
  // const user = profileStore.userDetails
  try {
    await updateProfileMutation.mutateAsync({
      // first_name: user?.first_name || '',
      // middle_name: user?.middle_name || null,
      // nickname: user?.nickname || null,
      // family_name: user?.family_name || '',
      dob: dob.value
      // state_id: user?.state_id || null,
      // community_name: user?.community_name || '',
      // mother_family_name: user?.mother_family_name || '',
      // gender: user?.gender || null,
    })
    await getProfile()
    message.success('Date of birth saved!')
    emit('update:show', false)
  } catch (error) {
    handleApiError(error, message)
  }
}
</script>
