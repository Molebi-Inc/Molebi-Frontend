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
        <div class="mt-5">
          <MlbInputOtp
            v-model="form.otp"
            name="otp"
            :length="4"
            :gap="24"
            size="large"
            mask
            custom-class="otp-input-wrapper border-gray-300 focus:border-primary-500"
          />
        </div>
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
      type="submit"
      label="Verify Account"
      block
      class="rounded-2xl! bg-primary-700! h-13! text-white!"
      @click="onFormSubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbInputOtp from '@/components/ui/MlbInputOtp.vue'
import { useMessage, NForm, NFormItem } from 'naive-ui'
import { useAuthConfig } from '@/config/auth.config'
import { otpValidation } from '@/validations/authentication.validations'
import { AlertService } from '@/services/alert.service'
import { handleApiError } from '@/helpers/error.helpers'
import { useVerifyEmailMutation, useResendOtpMutation } from '@/services/authentication.services'
import { useAuthenticationStore } from '@/stores/authentication.store'

const $router = useRouter()
const $route = useRoute()
const message = useMessage()
const authConfig = useAuthConfig()
const { form, rules } = otpValidation()
const verifyEmailMutation = useVerifyEmailMutation()
const resendOtpMutation = useResendOtpMutation()
const authenticationStore = useAuthenticationStore()

const countdown = ref<number>(30)
const loading = ref<boolean>(false)
const formRef = ref<FormInst | null>(null)

const startCountdown = () => {
  countdown.value = 10
  setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    }
  }, 1000)
}

const onFormSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    if ($route.name === 'Guests.ForgotPasswordView') {
      handleForgotPasswordFunctionality()
      return
    }
    try {
      loading.value = true
      const response = await verifyEmailMutation.mutateAsync({
        otp_code: form.value.otp.join(''),
      })
      authConfig.setToken(response.data.token)

      await AlertService.alert({
        imageUrl: 'images/success.png',
        imageAlt: 'Success',
        imageClass: 'w-24 h-24 object-contain',
        subject: 'You have successfully <br /> created your account',
        message:
          'Welcome to Molebi, you have successfully created your account, now you can go to the home screen to enjoy our offerings.',
        confirmButtonText: 'Go to home',
        cancelButtonText: 'Continue Onboarding',
        customClass: {
          confirmButton: 'rounded-2xl! bg-primary-700! h-13! text-white!',
          cancelButton: 'rounded-2xl! bg-primary-50! h-13! text-primary-700!',
        },
        buttonConfig: {
          confirm: {
            text: 'Go to home',
            action: async () => {
              $router.push({ name: 'App.HomeView' })
            },
            closeOnClick: true,
          },
          cancel: {
            text: 'Continue Onboarding',
            action: () => {
              $router.push({ name: 'Guests.OnboardingView', params: { module: 'personal-info' } })
            },
            closeOnClick: true,
          },
        },
      })
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = false
    }
  })
}

const handleForgotPasswordFunctionality = () => {
  const storeResetPassword = authenticationStore.resetPasswordForm
  authenticationStore.setStoreProp('resetPasswordForm', {
    ...storeResetPassword,
    otp_code: form.value.otp.join(''),
  })
  $router.push({ name: 'Guests.ForgotPasswordView', params: { module: 'reset' } })
  message.success('OTP saved successfully')
}

const onResendOTP = async () => {
  try {
    await resendOtpMutation.mutateAsync()
  } catch (error) {
    handleApiError(error, message)
  }
  startCountdown()
}

onMounted(() => {
  startCountdown()
})
</script>

<style scoped>
:deep(.otp-input-wrapper .n-input-wrapper) {
  background-color: #f1f1f1 !important;
  border-radius: 8px !important;
}

:deep(.otp-input-wrapper .n-input-wrapper:hover) {
  background-color: #e9e9e9 !important;
}

:deep(.otp-input-wrapper .n-input-wrapper:focus) {
  background-color: #f1f1f1 !important;
}
</style>
