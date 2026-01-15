<template>
  <div
    :class="[
      'bg-brand-background',
      isScrollable
        ? 'min-h-screen overflow-y-auto flex flex-col'
        : isDesktop
          ? 'h-screen overflow-hidden md:grid grid-cols-7'
          : 'h-screen overflow-hidden flex flex-col',
    ]"
  >
    <div
      :class="[
        'border-r border-secondary-200 bg-white',
        isDesktop
          ? 'col-span-4 md:px-[72px] md:py-[40px] flex flex-col overflow-hidden'
          : 'px-6 py-8 flex flex-col',
      ]"
    >
      <header v-if="isDesktop" class="shrink-0">
        <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
      </header>
      <div
        :class="[
          isDesktop
            ? 'flex-1 flex justify-center items-center min-h-0'
            : 'flex-1 flex justify-center items-center',
        ]"
      >
        <div
          :class="[
            'w-full flex items-center justify-center',
            isDesktop
              ? 'h-full max-w-[344px] max-h-[344px] md:max-w-[540px] md:max-h-[540px]'
              : isScrollable
                ? 'max-w-[280px] max-h-[280px]'
                : 'max-w-[320px] max-h-[320px]',
          ]"
        >
          <img :src="component?.image_url" alt="Molebi" class="w-full h-full object-contain" />
        </div>
      </div>
    </div>
    <div
      :class="[
        'flex flex-col',
        isDesktop
          ? 'col-span-3 md:px-[120px] px-6 overflow-hidden py-4 md:py-8 justify-center'
          : 'px-6 py-6 justify-center flex-1',
      ]"
    >
      <div class="flex justify-start mb-4 md:mb-8 shrink-0">
        <BackButton
          v-if="component?.has_back_button && isDesktop"
          icon="vuesax.linear.arrow-left"
        />
      </div>
      <div class="flex items-center gap-2 mb-2 shrink-0">
        <div
          v-for="i in 3"
          :key="i"
          :class="[
            'h-2 rounded-full',
            i === component?.step ? 'w-6 bg-primary-300' : 'w-2 bg-gray-100',
          ]"
        ></div>
      </div>
      <h1
        :class="[
          'font-semibold mb-2 text-black shrink-0',
          isDesktop ? 'text-2xl' : isScrollable ? 'text-xl' : 'text-xl',
        ]"
      >
        {{ component?.title }}
      </h1>
      <p :class="['text-black shrink-0', isDesktop ? 'text-body-sm mb-4 md:mb-0' : 'text-sm mb-4']">
        {{ component?.description }}
      </p>
      <div
        :class="[
          'flex flex-col gap-3 shrink-0',
          isDesktop ? 'mt-4 md:mt-12 mb-2 md:mb-3.5 md:gap-4' : 'mt-6 mb-4',
        ]"
      >
        <MlbButton
          :label="component?.primary_button_label"
          block
          class="bg-primary-700! text-white! rounded-2xl! h-13!"
          @click="component && $router.push(component.primary_button_route)"
        />
        <MlbButton
          block
          :label="component?.secondary_button_label"
          class="bg-primary-50! text-primary-900! rounded-2xl! h-13! border-primary-700!"
          @click="component && $router.push(component.secondary_button_route)"
        />
      </div>
      <div :class="['text-black shrink-0', isDesktop ? 'text-caption' : 'text-xs mt-4']">
        By continuing, you agree to Molebi's
        <router-link :to="{ name: 'Guests.TermsOfServiceView' }" class="underline"
          >Terms of Service</router-link
        >
        and
        <router-link :to="{ name: 'Guests.PrivacyPolicyView' }" class="underline"
          >Privacy Policy</router-link
        >
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
// iPhone 8 is 375px - screens 375px and below should scroll
const isScrollable = useMediaQuery('(max-width: 375px)')
// Desktop is 768px and above - uses grid layout
const isDesktop = useMediaQuery('(min-width: 768px)')
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

// Import all images dynamically using import.meta.glob
const imageModules = import.meta.glob(['/src/assets/svg/*.svg', '/src/assets/images/*.png'], {
  eager: true,
  query: '?url',
  import: 'default',
})

const componentConfigs: Record<ModuleKey, ComponentConfig> = {
  welcome: {
    step: 1,
    image_url: '/src/assets/svg/tree.svg',
    title: 'Watch Your Family Grow',
    description:
      'See your family come to life as a growing tree—every new member adds a branch, and every connection deepens your story.',
    primary_button_label: 'Next',
    secondary_button_label: 'Skip',
    primary_button_route: { name: 'Guests.LandingView', params: { module: 'connection' } },
    secondary_button_route: { name: 'Guests.OnboardingSignup', params: { module: 'signup' } },
  },
  connection: {
    step: 2,
    image_url: '/src/assets/images/feature-card.png',
    title: 'Stay Rooted, Stay Connected',
    has_back_button: true,
    description:
      'Discover and preserve the stories, traditions, and values that shape your heritage. Explore your town of origin, share insights, and connect with others who carry the same cultural roots—all within one shared space of belonging.',
    primary_button_label: 'Next',
    secondary_button_label: 'Skip',
    primary_button_route: { name: 'Guests.LandingView', params: { module: 'vault' } },
    secondary_button_route: { name: 'Guests.OnboardingSignup', params: { module: 'signup' } },
  },
  vault: {
    step: 3,
    image_url: '/src/assets/images/folder.png',
    title: 'Protect What Matters Most',
    has_back_button: true,
    description:
      'Your Vault keeps precious memories, files, and voice notes safe—locked away for your eyes only. With Time Capsules, save messages, photos, or letters to be opened on a special day in the future. Because some moments deserve to wait.',
    primary_button_label: "Let's get started",
    secondary_button_label: 'I already have an account',
    primary_button_route: { name: 'Guests.OnboardingSignup', params: { module: 'signup' } },
    secondary_button_route: { name: 'Guests.SigninView' },
  },
}

const component = computed<ComponentConfig | undefined>(() => {
  const module = $route.params.module as ModuleKey
  const config = componentConfigs[module]

  if (!config) return undefined

  // Get the proper URL from the imported modules
  const imageUrl = (imageModules[config.image_url] as string) || ''

  return {
    ...config,
    image_url: imageUrl,
  }
})
</script>
