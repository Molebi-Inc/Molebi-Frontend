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
            mask
            custom-class="otp-input-wrapper border-gray-300 focus:border-primary-500"
          />
        </div>
      </n-form-item>
    </div>
    <MlbButton
      type="submit"
      label="Submit"
      block
      :loading="loading"
      :disabled="loading"
      class="rounded-2xl! bg-primary-700! h-13! text-white!"
      @click="onFormSubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { ref } from 'vue'
// import { useRouter } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useMessage, NForm, NFormItem } from 'naive-ui'
import MlbInputOtp from '@/components/ui/MlbInputOtp.vue'
import { pinValidation } from '@/validations/vault.validations'
import { handleApiError } from '@/helpers/error.helpers'
import { useVerifyPinMutation } from '@/services/vault.services'
import { useVaultStore } from '@/stores/vault.store'

// const $router = useRouter()
const message = useMessage()
const vaultStore = useVaultStore()
const { form, rules } = pinValidation()
const verifyPinMutation = useVerifyPinMutation()

const emit = defineEmits<{
  (e: 'pinVerified', value: boolean): void
}>()

const loading = ref<boolean>(false)
const formRef = ref<FormInst | null>(null)

const onFormSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      loading.value = true
      await verifyPinMutation.mutateAsync({
        pin: form.value.pin.join('') as string,
        id: vaultStore.selectedFolder?.id as number,
      })
      // $router.push({ name: 'App.VaultFolderView' })
      emit('pinVerified', true)
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = false
    }
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
