<template>
  <!-- <Transition name="fade" mode="out-in"> -->
  <!-- Phase 1: Welcome -->
  <!-- <div v-if="phase === 'welcome'" key="welcome" class="pt-8 px-6 h-screen bg-brand-green flex flex-col">
      <header class="shrink-0">
        <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
      </header>
      <div class="flex-1 flex flex-col items-center justify-center gap-12">
        <img src="@/assets/svg/tree-3.svg" alt="Molebi Tree" class="w-24 h-24 md:w-36 md:h-36" />
        <div ref="viewportRef" class="scroll-text-viewport">
          <div
            class="scroll-text-strip"
            :style="{ transform: `translateY(-${currentIndex * slotHeightPx}px)` }"
          >
            <p
              v-for="(text, i) in renderTexts"
              :key="i"
              class="scroll-text-line"
              :class="{
                'scroll-text-current': i === currentIndex,
                'scroll-text-next': i === nextIndex,
              }"
            >
              {{ text }}
            </p>
          </div>
        </div>
        <MlbButton
          label="Skip"
          class="md:w-[50%]! w-full! bg-primary-50! text-primary-900! rounded-2xl! h-13! border-primary-700!"
          @click="enterCarouselPhase"
        />
      </div>
    </div> -->

  <!-- Phase 2: Carousel + Signup -->
  <div key="carousel" :class="[
    'bg-brand-green',
    isScrollable
      ? 'min-h-screen overflow-y-auto flex flex-col'
      : isDesktop
        ? 'h-screen overflow-hidden md:grid grid-cols-6 gap-4'
        : 'h-screen overflow-hidden flex flex-col',
  ]">
    <!-- Left: Carousel -->
    <div :class="[
      isDesktop
        ? 'col-span-3 md:px-[72px] md:py-[40px] flex flex-col overflow-hidden'
        : 'px-6 py-8 flex flex-col',
    ]">
      <header v-if="isDesktop" class="shrink-0">
        <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
      </header>

      <div class="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
        <div class="flex transition-transform duration-500 ease-in-out"
          :style="{ transform: `translateX(-${carouselIndex * 100}%)` }" @mouseenter="pauseCarousel"
          @mouseleave="resumeCarousel" @focusin="pauseCarousel" @focusout="resumeCarousel"
          @touchstart.passive="pauseCarousel" @touchend.passive="resumeCarousel">
          <div v-for="(config, index) in resolvedConfigs" :key="index" class="w-full shrink-0">
            <div :class="isSmall ? 'flex flex-row items-center gap-4' : 'flex flex-col gap-6'">
              <div :class="[
                'flex items-center justify-center overflow-hidden',
                isSmall ? 'w-1/2 shrink-0' : 'h-[260px]',
              ]">
                <img :src="config.image_url" alt="Molebi" class="w-full h-full object-contain" />
              </div>
              <div :class="isSmall ? 'w-1/2' : ''">
                <div class="flex items-center gap-2 mb-3">
                  <div v-for="i in componentConfigs.length" :key="i" :class="[
                    'h-2 rounded-full transition-all duration-300',
                    i - 1 === carouselIndex ? 'w-6 bg-primary-300' : 'w-2 bg-gray-100',
                  ]"></div>
                </div>
                <h1 :class="[
                  'font-semibold mb-2 text-black',
                  isDesktop ? 'text-2xl' : 'text-xl',
                ]">
                  {{ config.title }}
                </h1>
                <p class="text-black text-sm">{{ config.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Signup form -->
    <div class="flex flex-col col-span-3 px-[38px] py-8 justify-center min-h-0">
      <div
        class="md:rounded-3xl signup-form md:bg-white flex flex-col min-h-0 max-h-full overflow-hidden px-6 py-8 md:p-12">
        <div class="shrink-0">
          <BackButton icon="vuesax.linear.arrow-left" class="mb-4! md:mb-6!" @click="$router.back()" />
        </div>
        <div class="flex flex-col gap-[45px] min-h-0 md:px-4 overflow-y-auto">
          <div class="shrink-0">
            <h1 class="text-neutral-900 font-semibold text-2xl mb-2">
              Create your Molebi account
            </h1>
            <p class="text-neutral-600 font-normal text-sm">
              Start building your private family space
            </p>
          </div>
          <div class="min-h-0">
            <SignupForm constrained version="v2" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- </Transition> -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRouter } from 'vue-router'
import BackButton from '@/components/common/BackButton.vue'
import SignupForm from '@/components/auth/SignupForm.vue'
// import MlbButton from '@/components/ui/MlbButton.vue'

const $router = useRouter()
const isScrollable = useMediaQuery('(max-width: 375px)')
const isSmall = useMediaQuery('(max-width: 400px)')
const isDesktop = useMediaQuery('(min-width: 768px)')


const viewportRef = ref<HTMLElement | null>(null)
const slotHeightPx = ref(72)

let welcomeTimer: ReturnType<typeof setInterval> | null = null

const syncSlotHeight = () => {
  const el = viewportRef.value
  if (!el) return
  const raw = getComputedStyle(el).getPropertyValue('--slot-h').trim()
  const parsed = Number.parseFloat(raw)
  if (Number.isFinite(parsed) && parsed > 0) slotHeightPx.value = parsed
}

const clearWelcomeTimer = () => {
  if (welcomeTimer) { clearInterval(welcomeTimer); welcomeTimer = null }
}

// ─── Carousel ─────────────────────────────────────────────────────────────────
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

const imageModules = import.meta.glob([
  '/src/assets/svg/*.svg',
  '/src/assets/images/*.png',
  '/src/assets/gifs/*.gif',
], {
  eager: true,
  query: '?url',
  import: 'default',
})

const componentConfigs: ComponentConfig[] = [
  {
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
  // {
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
  {
    step: 2,
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
]

const resolvedConfigs = computed(() =>
  componentConfigs.map((config) => ({
    ...config,
    image_url: (imageModules[config.image_url] as string) || '',
  })),
)

const carouselIndex = ref(0)
let carouselTimer: ReturnType<typeof setInterval> | null = null
const isCarouselPaused = ref(false)

const clearCarouselTimer = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

const startCarouselAutoScroll = () => {
  clearCarouselTimer()
  if (componentConfigs.length <= 1) return

  carouselTimer = setInterval(() => {
    if (isCarouselPaused.value) return
    carouselIndex.value = (carouselIndex.value + 1) % componentConfigs.length
  }, 16_000)
}

const pauseCarousel = () => {
  isCarouselPaused.value = true
}

const resumeCarousel = () => {
  isCarouselPaused.value = false
}

const onVisibilityChange = () => {
  if (document.hidden) pauseCarousel()
  else resumeCarousel()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  nextTick(syncSlotHeight)
  window.addEventListener('resize', syncSlotHeight, { passive: true })
  // startWelcomeAnimation()
  document.addEventListener('visibilitychange', onVisibilityChange, { passive: true })
  startCarouselAutoScroll()
})

onUnmounted(() => {
  window.removeEventListener('resize', syncSlotHeight)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  clearWelcomeTimer()
  clearCarouselTimer()
})
</script>

<style scoped>
.signup-form {
  box-shadow: 0px 8px 20px 0px rgba(0, 0, 0, 0.08);
}

.scroll-text-viewport {
  --slot-h: 72px;
  height: calc(var(--slot-h) * 2);
  overflow: hidden;
  width: 100%;
  max-width: 320px;
}

.scroll-text-strip {
  transition: transform 0.5s ease-out;
}

.scroll-text-line {
  height: var(--slot-h);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
  text-align: center;
  font-size: 16px;
  line-height: 1.2;
  padding: 0.25rem 0.5rem;
  margin: 0;
  font-weight: 500;
}

.scroll-text-current {
  color: #036603;
}

.scroll-text-next {
  color: rgba(219, 111, 35, 0.3);
}

@media (min-width: 768px) {
  .scroll-text-line {
    font-size: 24px;
    font-weight: 600;
  }

  .scroll-text-viewport {
    --slot-h: 100px;
    max-width: 520px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
