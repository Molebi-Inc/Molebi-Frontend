<template>
  <div class="md:grid grid-cols-7 gap-4 bg-brand-background h-screen">
    <div
      class="border-r border-secondary-200 bg-white col-span-4 md:px-[72px] md:py-[40px] px-6 py-8"
    >
      <header v-if="isLargeScreen">
        <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
      </header>
      <div class="flex justify-center items-center h-full">
        <div class="w-[344px] h-[344px] md:w-[540px] md:h-auto mt-12 md:mt-0">
          <img :src="component?.image_url" alt="Molebi" class="" />
        </div>
      </div>
    </div>
    <div class="flex flex-col justify-center col-span-3 md:px-[120px] px-6">
      <BackButton
        v-if="component?.has_back_button && isLargeScreen"
        icon="vuesax.linear.arrow-left"
        class="mb-8 flex justify-start"
      />
      <div class="flex items-center gap-2 mb-2">
        <div
          v-for="i in 3"
          :key="i"
          :class="[
            'h-2 rounded-full',
            i === component?.step ? 'w-6 bg-primary-300' : 'w-2 bg-gray-100',
          ]"
        ></div>
      </div>
      <h1 class="text-2xl font-semibold mb-2 text-black">
        {{ component?.title }}
      </h1>
      <p class="text-black text-body-sm">
        {{ component?.description }}
      </p>
      <div class="flex flex-col mt-12 mb-3.5 gap-4">
        <MlbButton
          :label="component?.primary_button_label"
          block
          class="bg-primary-700! text-white! rounded-2xl! h-13!"
          @click="$router.push(component?.primary_button_route ?? {})"
        />
        <MlbButton
          block
          :label="component?.secondary_button_label"
          class="bg-primary-50! text-primary-900! rounded-2xl! h-13! border-primary-700!"
          @click="$router.push(component?.secondary_button_route ?? {})"
        />
      </div>
      <div class="text-black text-caption">
        By continuing, you agree to Molebi's
        <a href="#" class="underline">Terms of Service</a> and
        <a href="#" class="underline">Privacy Policy</a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import BackButton from '@/components/common/BackButton.vue'
import MlbButton from '@/components/ui/MlbButton.vue'

const $route = useRoute()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const $router = useRouter()

type ComponentConfig = {
  step: number
  image_url: string
  title: string
  description: string
  primary_button_label: string
  secondary_button_label: string
  primary_button_route: { name: string; params?: Record<string, any> }
  secondary_button_route: { name: string; params?: Record<string, any> }
  has_back_button?: boolean
}

type ModuleKey = 'welcome' | 'connection' | 'vault'

const componentConfigs: Record<ModuleKey, ComponentConfig> = {
  welcome: {
    step: 1,
    image_url: '/src/assets/svg/tree.svg',
    title: 'Watch Your Family Grow',
    description:
      'See your family come to life as a growing tree every new member adds a branch, every connection deepens your story.',
    primary_button_label: 'Next',
    secondary_button_label: 'Skip',
    primary_button_route: { name: 'Guests.LandingView', params: { module: 'connection' } },
    secondary_button_route: { name: 'Guests.OnboardingView', params: { module: 'signup' } },
  },
  connection: {
    step: 2,
    image_url: '/src/assets/images/feature-card.png',
    title: 'Stay Rooted, Stay Connected',
    has_back_button: true,
    description:
      'Discover and preserve the stories, traditions, and values that shape your heritage. Explore your town of origin, share insights, and connect with others who carry the same cultural roots, all in one shared space of belonging.',
    primary_button_label: 'Next',
    secondary_button_label: 'Skip',
    primary_button_route: { name: 'Guests.LandingView', params: { module: 'vault' } },
    secondary_button_route: { name: 'Guests.OnboardingView', params: { module: 'signup' } },
  },
  vault: {
    step: 3,
    image_url: '/src/assets/images/folder.png',
    title: 'Protect What Matters Most',
    has_back_button: true,
    description:
      'Your Vault keeps precious memories, files, and voice notes safe  locked away for your eyes only.With Time Capsules, save messages, photos, or letters to be opened on a special day in the future. Because some moments deserve to wait.',
    primary_button_label: "Let's get started",
    secondary_button_label: 'I already have an account',
    primary_button_route: { name: 'Guests.OnboardingView', params: { module: 'signup' } },
    secondary_button_route: { name: 'Guests.SigninView' },
  },
}

const component = computed<ComponentConfig | undefined>(() => {
  const module = $route.params.module as ModuleKey
  return componentConfigs[module]
})
</script>
