<template>
  <div>
    <n-form
      ref="formRef"
      :label-width="80"
      :model="form"
      :rules="rules"
      class="h-full flex md:block flex-col justify-between items-center"
    >
      <div class="w-full flex flex-col gap-2">
        <n-form-item label="Password" path="password">
          <MlbInput
            v-model="form.password"
            id="password"
            name="password"
            type="password"
            show-password-on="mousedown"
            placeholder="Enter your password"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Confirm Password" path="password_confirmation">
          <MlbInput
            v-model="form.password_confirmation"
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            show-password-on="mousedown"
            placeholder="Confirm your password"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
      </div>
      <MlbButton
        type="primary"
        label="Login"
        block
        class="rounded-2xl! bg-primary-700! h-13!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
  <n-drawer v-model:show="active" placement="bottom" :height="306" class="rounded-t-3xl!">
    <n-drawer-content>
      <FeedbackComponent @back="active = false" />
    </n-drawer-content>
  </n-drawer>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { changePasswordValidation } from '@/validations/authentication.validations'
import { FormInst, useMessage, NForm, NFormItem, NDrawer, NDrawerContent } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import FeedbackComponent from '@/components/auth/FeedbackComponent.vue'

const $router = useRouter()
const message = useMessage()
const { form, rules } = changePasswordValidation()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const formRef = ref<FormInst | null>(null)
const active = ref<boolean>(false)

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    !isLargeScreen.value
      ? (active.value = true)
      : $router.push({ name: 'Guests.ForgotPasswordView', params: { module: 'success' } })
  })
}
</script>
