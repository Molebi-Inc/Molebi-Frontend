<template>
  <main>
    <div class="md:flex justify-center items-center h-screen">
      <div
        :class="[
          {
            'md:border border-secondary-200 md:bg-white ': $route.params.module === 'signup',
          },
          'px-4 py-8 md:p-12 md:w-[522px] h-full md:rounded-3xl',
        ]"
      >
        <BackButton
          v-if="$route.params.module !== 'success'"
          icon="vuesax.linear.arrow-left"
          class="mb-6"
        />
        <div class="flex flex-col gap-[45px] h-full md:px-4">
          <div>
            <h1 class="text-neutral-900 font-semibold text-2xl mb-2">{{ component?.title }}</h1>
            <p class="text-neutral-600 font-normal text-sm">{{ component?.description }}</p>
          </div>
          <component :is="component?.component" :key="$route.params.module as string" />
        </div>
      </div>
    </div>
    <!-- <n-drawer v-model:show="active" placement="bottom" :height="306" class="rounded-t-3xl!">
      <n-drawer-content>
        <FeedbackComponent @back="active = false" />
      </n-drawer-content>
    </n-drawer> -->
  </main>
</template>

<script setup lang="ts">
import {
  computed,
  // , ref, watch
} from 'vue'
import { useRoute } from 'vue-router'
// import { useMediaQuery } from '@vueuse/core'
// import { NDrawer, NDrawerContent } from 'naive-ui'
import OtpForm from '@/components/auth/OtpForm.vue'
import { maskEmail } from '@/helpers/general.helpers'
import SignupForm from '@/components/auth/SignupForm.vue'
import BackButton from '@/components/common/BackButton.vue'
import FeedbackComponent from '@/components/auth/FeedbackComponent.vue'
import { useAuthenticationStore } from '@/stores/authentication.store'

const $route = useRoute()
const authenticationStore = useAuthenticationStore()
// const isLargeScreen = useMediaQuery('(min-width: 768px)')

// const active = ref<boolean>(false)

const component = computed(() => {
  return {
    signup: {
      title: 'Lets get you started',
      description: 'Create an account today with Molebi',
      component: SignupForm,
    },
    'verify-email': {
      title: 'Verify Your Email',
      description: `We sent a 4 digit code to ${maskEmail(authenticationStore.signupForm?.email)}`,
      component: OtpForm,
    },
    success: {
      component: FeedbackComponent,
    },
  }[$route.params.module as string]
})

// watch(
//   [isLargeScreen, () => $route.params.module],
//   ([isLargeScreenVal, moduleVal]) => {
//     if (isLargeScreenVal === false && moduleVal === 'success') {
//       active.value = true
//     }
//   },
//   { immediate: true },
// )
</script>
