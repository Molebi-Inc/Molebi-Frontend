<template>
  <n-form
    ref="formRef"
    :label-width="80"
    :model="form"
    :rules="rules"
    class="h-full flex md:block flex-col justify-between items-center"
  >
    <div class="flex flex-col justify-center items-center mb-11">
      <n-form-item
        v-if="step === 1"
        :show-require-mark="false"
        :show-label="false"
        path="pin"
        feedback-class="mt-5 text-center"
      >
        <div class="mt-5">
          <MlbInputOtp
            v-model="form.pin"
            name="pin"
            :length="4"
            :gap="24"
            size="large"
            :mask="false"
            custom-class="otp-input-wrapper border-gray-300 focus:border-primary-500"
          />
        </div>
      </n-form-item>
      <n-form-item
        v-if="props.hasConfirmation && step === 2"
        :show-require-mark="false"
        :show-label="false"
        path="pin_confirmation"
        feedback-class="mt-5 text-center"
      >
        <div class="mt-5">
          <MlbInputOtp
            v-model="form.pin_confirmation"
            name="pin_confirmation"
            :length="4"
            :gap="24"
            size="large"
            :mask="false"
            custom-class="otp-input-wrapper border-gray-300 focus:border-primary-500"
          />
        </div>
      </n-form-item>
    </div>
    <MlbButton
      label="Submit"
      block
      :loading="loading"
      :disabled="loading"
      class="rounded-2xl! bg-primary-700! h-13! text-white!"
      @click.prevent="onFormSubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { ref, computed } from 'vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useMessage, NForm, NFormItem } from 'naive-ui'
import MlbInputOtp from '@/components/ui/MlbInputOtp.vue'
import { pinValidation } from '@/validations/vault.validations'
import { useVaultStore } from '@/stores/vault.store'

const message = useMessage()
const vaultStore = useVaultStore()

const props = withDefaults(
  defineProps<{
    loading: boolean
    hasConfirmation?: boolean
  }>(),
  {
    loading: false,
    hasConfirmation: false,
  },
)
const { form, rules } = pinValidation(props.hasConfirmation)

const emit = defineEmits<{
  (e: 'pinSubmitted', value: string): void
}>()

const step = computed<number>(() => vaultStore.pinStep)
const formRef = ref<FormInst | null>(null)

const onFormSubmit = () => {
  if (step.value === 1 && props.hasConfirmation) {
    vaultStore.setStoreProp('pinStep', 2)
    return
  }
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    emit('pinSubmitted', form.value.pin.join('') as string)
  })
}
</script>

<style scoped>
:deep(.otp-input-wrapper .n-input-wrapper) {
  background-color: #f1f1f1 !important;
  border-radius: 8px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

:deep(.otp-input-wrapper .n-input-wrapper:hover) {
  background-color: #e9e9e9 !important;
}

:deep(.otp-input-wrapper .n-input-wrapper:focus) {
  background-color: #f1f1f1 !important;
}
:deep(.otp-input-wrapper .n-input.n-input--resizable.n-input--stateful) {
  height: 60px !important;
  width: 60px !important;
}
</style>
