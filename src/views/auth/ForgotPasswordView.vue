<template>
  <section>
    <div class="md:flex justify-center items-center h-screen">
      <div class="px-6 py-24 md:p-12 md:w-[522px] rounded-3xl h-full">
        <BackButton
          v-if="!component?.hideBackButton"
          icon="vuesax.linear.arrow-left"
          class="mb-6"
        />
        <div class="flex flex-col gap-[45px] h-full">
          <div>
            <h1 class="text-neutral-900 font-semibold text-2xl mb-2 text-left md:text-center">
              {{ component?.title }}
            </h1>
            <p class="text-neutral-600 font-normal text-sm text-left md:text-center">
              {{ component?.description }}
            </p>
          </div>
          <component :is="component?.component" :key="String($route.params.module)" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from '@/components/common/BackButton.vue'
import ResetPasswordEmailForm from '@/components/auth/ResetPasswordEmailForm.vue'
import OtpForm from '@/components/auth/OtpForm.vue'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue'
import FeedbackComponent from '@/components/auth/FeedbackComponent.vue'
import { useAuthenticationStore } from '@/stores/authentication.store'
import { maskEmail } from '@/helpers/general.helpers'

const $route = useRoute()
const authenticationStore = useAuthenticationStore()

const component = computed(() => {
  return {
    email: {
      component: ResetPasswordEmailForm,
      key: 'email',
      title: 'Reset Password',
      description:
        'Enter your registered  email address and we’ll send you password reset instructions.',
    },
    otp: {
      component: OtpForm,
      key: 'otp',
      title: 'Verify Your Email',
      description: `We sent a 4 digit code to ${maskEmail(authenticationStore.resetPasswordForm?.email)}`,
    },
    reset: {
      component: ChangePasswordForm,
      key: 'reset',
      title: 'Change the password',
      description: 'Create your new Password',
    },
    success: {
      component: FeedbackComponent,
      key: 'success',
      title: '',
      description: '',
      hideBackButton: true,
    },
  }[$route.params.module as string]
})
</script>
