<template>
  <n-form ref="formRef" :label-width="80" :model="form" :rules="rules">
    <div class="flex flex-col mb-6 md:mb-11">
      <n-form-item label="Enter your email" path="email">
        <MlbInput
          v-model="form.email"
          id="email"
          name="email"
          type="email"
          placeholder="Enter Email"
          custom-class="border-gray-300 focus:border-primary-500"
        />
      </n-form-item>
    </div>
    <MlbButton
      type="primary"
      label="Proceed"
      block
      class="rounded-2xl! bg-primary-700! h-13!"
      @click="onFormSubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { FormInst, useMessage, NForm, NFormItem } from 'naive-ui'
import { useAuthenticationStore } from '@/stores/authentication.store'
import { resetPasswordValidation } from '@/validations/authentication.validations'

const message = useMessage()
const $router = useRouter()
const { form, rules } = resetPasswordValidation()
const authenticationStore = useAuthenticationStore()

const formRef = ref<FormInst | null>(null)

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    authenticationStore.setStoreProp('resetPasswordForm', { email: form.value.email })
    $router.push({ name: 'Guests.ForgotPasswordView', params: { module: 'otp' } })
  })
}
</script>
