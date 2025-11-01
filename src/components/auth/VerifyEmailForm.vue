<template>
  <div class="flex justify-center items-center h-screen">
    <div class="bg-white p-[48px] w-[522px] rounded-3xl">
      <BackButton icon="vuesax.linear.arrow-left" class="mb-6" />
      <div class="flex flex-col gap-[45px]">
        <div>
          <h1 class="text-neutral-900 font-semibold text-2xl mb-2 text-center">
            Verify Your Email
          </h1>
          <p class="text-neutral-600 font-normal text-sm line-height-18 text-center">
            We sent a 4 digit code to {{ email }}
          </p>
        </div>
        <div>
          <n-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="flex flex-col gap-6 w-full"
          >
            <div class="flex flex-col gap-5 items-center">
              <label for="otp" class="text-sm font-medium text-gray-600 text-center"
                >Enter OTP Here</label
              >
              <n-form-item path="otp" :show-require-mark="false" :show-feedback="false">
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
            </div>
            <div class="text-center">
              <p class="text-gray-600 font-medium text-xs line-height-18 text-center">
                Did not get any mail, Resend OTP in
                <span class="text-primary-500 font-medium text-xs line-height-18"
                  >({{ countdown }}s)</span
                >
              </p>
            </div>
            <MlbButton
              type="submit"
              label="Verify Account"
              class="mb-4 rounded-2xl bg-green-700 py-4 px-7 text-white w-100"
              @click="onFormSubmit"
            />
          </n-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormInst, useMessage, NForm, NFormItem } from 'naive-ui'
import MlbInputOtp from '@/components/ui/MlbInputOtp.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import BackButton from '@/components/common/BackButton.vue'
import { onMounted, ref, computed } from 'vue'
import { useAuthenticationStore } from '@/stores/authentication.store'
import { maskEmail } from '@/helpers/general.helpers'
import { useRouter } from 'vue-router'
import { otpValidation } from '@/validations/authentication.validations'

const $router = useRouter()
const message = useMessage()
const authenticationStore = useAuthenticationStore()

const countdown = ref<number>(30)
const { form, rules } = otpValidation()
const formRef = ref<FormInst | null>(null)

const email = computed(() => maskEmail(authenticationStore.signupForm?.email))

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
      message.error('Form is not valid.')
      return
    }

    $router.push({ name: 'Guests.OnboardingView', params: { module: 'seed-planting' } })
  })
}
onMounted(() => {
  startCountdown()
})
</script>
