<template>
  <n-form ref="formRef" :label-width="80" :model="form" :rules="rules">
    <div class="flex flex-col mb-6 md:mb-5.5">
      <n-form-item label="Enter your email" path="email">
        <MlbInput
          v-model="form.email"
          id="email"
          name="email"
          type="text"
          placeholder="Enter Email"
          custom-class="border-gray-300 focus:border-primary-500"
        />
      </n-form-item>
    </div>
    <MlbButton
      type="submit"
      label="Proceed"
      block
      class="rounded-2xl! bg-primary-700! h-13! text-white!"
      :loading="loading"
      :disabled="loading"
      @click="onFormSubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import type { FormInst } from 'naive-ui'
import { useMessage, NForm, NFormItem } from 'naive-ui'
import { useAuthenticationStore } from '@/stores/authentication.store'
import { resetPasswordValidation } from '@/validations/authentication.validations'
import { useForgotPasswordMutation } from '@/services/authentication.services'
import { handleApiError } from '@/helpers/error.helpers'
import { useAuthConfig } from '@/config/auth.config'

const message = useMessage()
const $router = useRouter()
const { form, rules } = resetPasswordValidation()
const authenticationStore = useAuthenticationStore()
const forgotPasswordMutation = useForgotPasswordMutation()
const authConfig = useAuthConfig()

const formRef = ref<FormInst | null>(null)
const loading = ref<boolean>(false)

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      loading.value = true
      const storeResetPassword = authenticationStore.resetPasswordForm
      authenticationStore.setStoreProp('resetPasswordForm', {
        ...storeResetPassword,
        email: form.value.email,
      })

      const response = await forgotPasswordMutation.mutateAsync(form.value)

      authConfig.setOtpExpirationInMinutes(response.data.expires_in_minutes)
      authConfig.setOtpRequestTime(new Date().toISOString())

      message.success(response.message || 'Password reset instructions sent to your email')
      $router.push({ name: 'Guests.ForgotPasswordView', params: { module: 'otp' } })
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = false
    }
  })
}
</script>
