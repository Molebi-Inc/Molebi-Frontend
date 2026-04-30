<template>
  <div class="bg-brand-green h-dvh min-h-dvh overflow-hidden flex flex-col">
    <div class="flex items-center justify-between px-6 py-4">
      <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[142px] h-[40px]" />
      <BackButton icon="arrow-left" :icon-size="16" />
    </div>
    <div :class="[
      shouldScrollMobile
        ? 'flex-1 min-h-0 overflow-y-auto flex flex-col'
        : isDesktop
          ? 'flex-1 min-h-0 overflow-hidden md:grid grid-cols-7'
          : 'flex-1 min-h-0 overflow-hidden flex flex-col',
    ]">
      <div :class="[
        'border-r border-secondary-200 ',
        isDesktop
          ? 'col-span-4 md:px-[72px] md:py-[40px] flex flex-col overflow-hidden'
          : 'px-6 py-3 flex flex-col',
      ]">
        <header v-if="isDesktop" class="shrink-0">
          <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
        </header>
        <div :class="[
          isDesktop
            ? 'flex-1 flex justify-center items-center min-h-0'
            : 'flex justify-center items-center',
        ]">
          <div :class="[
            'w-full overflow-hidden mx-auto',
            isDesktop
              ? 'h-full max-w-[344px] max-h-[344px] md:max-w-[540px] md:max-h-[540px]'
              : shouldScrollMobile
                ? 'max-w-[280px] h-[220px]'
                : 'max-w-[320px] h-[280px]',
          ]" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel" @focusin="pauseCarousel"
            @focusout="resumeCarousel" @touchstart.passive="pauseCarousel" @touchend.passive="resumeCarousel">
            <div class="flex transition-transform duration-500 ease-in-out h-full"
              :style="{ transform: `translateX(-${carouselIndex * 100}%)` }">
              <div v-for="(config, index) in resolvedConfigs" :key="index"
                class="w-full shrink-0 h-full flex items-center justify-center">
                <img :src="config.image_url" alt="Molebi" class="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div :class="[
        'flex flex-col',
        isDesktop
          ? 'col-span-3 md:px-[120px] px-6 overflow-hidden py-4 md:py-8 justify-center'
          : 'px-6 pt-3 pb-2 justify-start',
      ]">
        <div class="flex justify-start mb-4 md:mb-8 shrink-0">
          <BackButton v-if="activeConfig?.has_back_button && isDesktop" icon="vuesax.linear.arrow-left" />
        </div>
        <div class="flex items-center gap-2 mb-2 shrink-0">
          <div v-for="i in resolvedConfigs.length" :key="i" :class="[
            'h-2 rounded-full',
            i - 1 === carouselIndex ? 'w-6 bg-primary-300' : 'w-2 bg-gray-100',
          ]"></div>
        </div>
        <h1 :class="[
          'font-semibold mb-2 text-black shrink-0 text-left',
          isDesktop ? 'text-2xl' : shouldScrollMobile ? 'text-lg' : 'text-xl',
        ]">
          {{ activeConfig?.title }}
        </h1>
        <p :class="['text-black shrink-0 text-left', isDesktop ? 'text-body-sm mb-4 md:mb-0' : 'text-sm mb-4']">
          {{ activeConfig?.description }}
        </p>
        <div :class="[
          'flex flex-col gap-3 shrink-0',
          isDesktop ? 'mt-4 md:mt-12 mb-2 md:mb-3.5 md:gap-4' : 'mt-6 mb-4',
        ]">
          <MlbButton label="Next" block class="bg-primary-700! text-white! rounded-2xl! h-13!"
            @click="$router.push({ name: 'Guests.OnboardingSignup', params: { module: 'signup' } })" />
        </div>
        <div :class="['text-black shrink-0', isDesktop ? 'text-caption' : 'text-xs mt-4']">
          By continuing, you agree to Molebi's
          <a href="https://molebiapp.com/terms-of-service" target="_blank" class="underline">Terms of Service</a>
          and
          <a href="https://molebiapp.com/privacy-policy" target="_blank" class="underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import BackButton from '@/components/common/BackButton.vue'
import MlbButton from '@/components/ui/MlbButton.vue'

const $route = useRoute()
const $router = useRouter()

const isDesktop = useMediaQuery('(min-width: 768px)')
const isScrollable = useMediaQuery('(max-width: 345px)')
const isCompactHeight = useMediaQuery('(max-height: 700px)')
const shouldScrollMobile = computed(
  () => !isDesktop.value && (isScrollable.value || isCompactHeight.value),
)

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

type ModuleKey = 'welcome' | 'vault'// | 'connection'

const imageModules = import.meta.glob(['/src/assets/svg/*.svg', '/src/assets/images/*.png', '/src/assets/gifs/*.gif'], {
  eager: true,
  query: '?url',
  import: 'default',
})

const componentConfigs: Record<ModuleKey, ComponentConfig> = {
  welcome: {
    step: 1,
    image_url: '/src/assets/gifs/welcome_page.gif',
    title: 'Build your Family Tree with Photos in minutes',
    description:
      'Private family tree builder, genealogy search tool, and invite-only family network to keep memories, relatives, and family conversations in one place.',
    primary_button_label: 'Next',
    secondary_button_label: 'Skip',
    primary_button_route: { name: 'Guests.LandingView', params: { module: 'connection' } },
    secondary_button_route: { name: 'Guests.OnboardingSignup', params: { module: 'signup' } },
  },
  // connection: {
  //   step: 2,
  //   image_url: '/src/assets/gifs/safe_space.gif',
  //   title: 'Safer than Social Media for Families',
  //   has_back_button: true,
  //   description:
  //     'Molebi is a private family-only social app for families, invite-only circles, and WhatsApp alternatives that respect all family members.',
  //   primary_button_label: 'Next',
  //   secondary_button_label: 'Skip',
  //   primary_button_route: { name: 'Guests.LandingView', params: { module: 'vault' } },
  //   secondary_button_route: { name: 'Guests.OnboardingSignup', params: { module: 'signup' } },
  // },
  vault: {
    step: 3,
    image_url: '/src/assets/gifs/private_media.gif',
    title: 'Private albums, videos, and cultural heritage',
    has_back_button: true,
    description:
      'Store photos, videos, and audio stories in one secure family archive. From weddings to naming ceremonies, Molebi keeps the moments that matter safe for the next generation.',
    primary_button_label: "Let's get started",
    secondary_button_label: 'I already have an account',
    primary_button_route: { name: 'Guests.OnboardingSignup', params: { module: 'signup' } },
    secondary_button_route: { name: 'Guests.SigninView' },
  },
}

const moduleOrder: ModuleKey[] = ['welcome', 'vault']//'connection',

const resolvedConfigs = computed<ComponentConfig[]>(() =>
  moduleOrder
    .map((key) => componentConfigs[key])
    .filter(Boolean)
    .map((config) => ({
      ...config,
      image_url: (imageModules[config.image_url] as string) || '',
    })),
)

const getIndexFromRoute = (): number => {
  const routeModule = ($route.params.module as ModuleKey | undefined) ?? 'welcome'
  const idx = moduleOrder.indexOf(routeModule)
  return idx >= 0 ? idx : 0
}

const carouselIndex = ref(getIndexFromRoute())
const activeConfig = computed(() => resolvedConfigs.value[carouselIndex.value])

watch(
  () => $route.params.module,
  () => {
    carouselIndex.value = getIndexFromRoute()
  },
)

let carouselTimer: ReturnType<typeof setInterval> | null = null
const isCarouselPaused = ref(false)

const clearCarouselTimer = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

const pauseCarousel = () => {
  isCarouselPaused.value = true
}

const resumeCarousel = () => {
  isCarouselPaused.value = false
}

const startCarouselAutoScroll = () => {
  clearCarouselTimer()
  if (resolvedConfigs.value.length <= 1) return
  carouselTimer = setInterval(() => {
    if (isCarouselPaused.value) return
    carouselIndex.value = (carouselIndex.value + 1) % resolvedConfigs.value.length
  }, 10_000)
}

watch(carouselIndex, (idx) => {
  const key = moduleOrder[idx]
  if (!key) return
  if ($route.params.module === key) return
  $router.replace({ name: 'Guests.LandingView', params: { module: key } })
})

const onVisibilityChange = () => {
  if (document.hidden) pauseCarousel()
  else resumeCarousel()
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange, { passive: true })
  startCarouselAutoScroll()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  clearCarouselTimer()
})
</script>
