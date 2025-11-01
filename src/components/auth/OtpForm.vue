<template>
  <n-form
    ref="formRef"
    :label-width="80"
    :model="form"
    :rules="rules"
    class="h-full flex md:block flex-col justify-between items-center"
  >
    <div class="flex flex-col justify-center items-center">
      <n-form-item
        label="Enter OTP Here"
        label-placement="top"
        label-style="display: flex; justify-content: center; color: #737373;"
        feedback-style="display: flex; justify-content: center; color: #737373; margin-bottom: 10px;"
        :show-require-mark="false"
        path="otp"
      >
        <MlbInputOtp
          v-model="form.otp"
          name="otp"
          :length="4"
          :gap="24"
          size="large"
          mask
          custom-class="border-gray-300 focus:border-primary-500"
        />
      </n-form-item>
      <div class="flex justify-center items-center mb-5">
        <p class="text-gray-600 font-medium text-xs line-height-18 text-center">
          Did not get any mail,
          <span v-if="countdown > 0">
            resend OTP in
            <span class="text-primary-500 font-medium text-xs line-height-18"
              >({{ countdown }}s)</span
            >
          </span>
          <MlbButton
            v-else
            text
            label="resend OTP"
            class="text-primary-500! font-medium text-xs line-height-18 underline!"
            @click="onResendOTP"
          />
        </p>
      </div>
    </div>
    <MlbButton
      type="primary"
      label="Verify Account"
      block
      class="rounded-2xl! bg-primary-700! h-13!"
      @click="onFormSubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbInputOtp from '@/components/ui/MlbInputOtp.vue'
import { FormInst, useMessage, NForm, NFormItem } from 'naive-ui'
import { otpValidation } from '@/validations/authentication.validations'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const { form, rules } = otpValidation()

const countdown = ref<number>(30)
const formRef = ref<FormInst | null>(null)

const startCountdown = () => {
  countdown.value = 30
  setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    }
  }, 1000)
}

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    $router.push(handleComponentRouting.value)
  })
}

const handleComponentRouting = computed(() => {
  return {
    'Guests.OnboardingView': {
      name: 'Guests.OnboardingView',
      params: { module: 'success' },
    },
    'Guests.ForgotPasswordView': {
      name: 'Guests.ForgotPasswordView',
      params: { module: 'reset' },
    },
  }[$route.name as string]
})

const onResendOTP = () => {
  startCountdown()
}

onMounted(() => {
  startCountdown()
})
</script>
