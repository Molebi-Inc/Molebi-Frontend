<template>
  <div class="w-full bg-white md:bg-transparent">
    <div :class="['w-full', { 'md:flex justify-center items-center': !component?.has_full_page }]">
      <div
      v-if="!isLinkExpired"
        :class="[
          {
            'md:border border-secondary-200 md:bg-white ': ['signup', 'personal-info'].includes(
              String($route.params.module || ''),
            ),
          },
          {
            'px-6 py-8 md:p-12 md:w-[522px] h-full md:rounded-3xl': !component?.has_full_page,
            'w-full': component?.has_full_page,
          },
        ]"
      >
        <BackButton
          v-if="component?.has_back_button"
          icon="vuesax.linear.arrow-left"
          class="mb-4! md:mb-6!"
        />
        <div
          :class="[
            'flex flex-col gap-[45px] h-full',
            { 'w-full': component?.has_full_page, 'md:px-4': !component?.has_full_page },
          ]"
        >
          <div v-if="!component?.has_full_page">
            <h1 class="text-neutral-900 font-semibold text-2xl mb-2 md:text-center">
              {{ component?.title }}
            </h1>
            <p class="text-neutral-600 font-normal text-sm md:text-center">
              {{ component?.description }}
            </p>
          </div>
          <component
            :is="component?.component"
            :key="String($route.params.module ?? '')"
            :invitation-params="invitationParams"
          />
        </div>
      </div>
      <LinkExpiredView v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import OtpForm from '@/components/auth/OtpForm.vue'
import { maskEmail } from '@/helpers/general.helpers'
import SignupForm from '@/components/auth/SignupForm.vue'
import BackButton from '@/components/common/BackButton.vue'
import { useAuthenticationStore } from '@/stores/authentication.store'
import PersonalInformationForm from '@/components/auth/PersonalInformationForm.vue'
import SeedPhase from '@/components/auth/SeedPhase.vue'
import LinkExpiredView from '@/components/auth/LinkExpiredView.vue'
import type { InvitationParamsInterface } from '@/types/authentication.types'

const $route = useRoute()
const authenticationStore = useAuthenticationStore()
const isLinkExpired = ref(false)
const invitationParams = ref<InvitationParamsInterface | null>(null)

const moduleParam = computed(() => String($route.params.module || ''))

// Check if link has expired
const checkLinkExpiry = () => {
  const expires = $route.query.expires
  const family_member_id = $route.query.family_member_id
  const signature = $route.query.signature

  // Check if invitation params are present
  if (expires && family_member_id && signature) {
    invitationParams.value = {
      expires: Number(expires),
      family_member_id: Number(family_member_id),
      signature: String(signature),
    }

    // Check if link has expired (expires is a timestamp in seconds)
    const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
    const expiresTimestamp = Number(expires)

    if (expiresTimestamp && currentTime > expiresTimestamp) {
      isLinkExpired.value = true
      return
    }
  }
}

onMounted(() => {
  checkLinkExpiry()
})

const component = computed(() => {
  return {
    signup: {
      title: 'Lets get you started',
      description: 'Create an account today with Molebi',
      has_back_button: true,
      component: SignupForm,
    },
    'verify-email': {
      title: 'Verify Your Email',
      description: `We sent a 4 digit code to ${maskEmail(authenticationStore.signupForm?.email)}`,
      has_back_button: true,
      component: OtpForm,
    },
    'seed-phase': {
      has_back_button: false,
      has_full_page: true,
      component: SeedPhase,
    },
    'personal-info': {
      title: 'Personal Information',
      description: 'Add your personal information to continue',
      has_back_button: true,
      component: PersonalInformationForm,
    },
  }[moduleParam.value]
})
</script>
