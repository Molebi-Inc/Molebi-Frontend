<template>
  <div key="carousel" :class="[
    'bg-brand-green',
    isScrollable
      ? 'min-h-screen overflow-y-auto flex flex-col'
      : isDesktop
        ? 'h-screen overflow-hidden md:grid grid-cols-6 gap-4'
        : 'h-screen overflow-hidden flex flex-col',
  ]">
    <div :class="[
      isDesktop
        ? 'col-span-3 md:px-[72px] md:py-[40px] flex flex-col overflow-hidden'
        : 'px-6 py-8 hidden',
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

    <div class="flex flex-col col-span-3 px-[38px] py-8 justify-center min-h-0">
      <div class="md:rounded-3xl flex flex-col min-h-0 max-h-full overflow-hidden md:px-6 py-8 md:p-12">
        <div class="min-h-0">
          <InvitationCard :invitationDetails="invitationDetails" :loading="loading" @accept="onAccept"
            @decline="onDecline" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import InvitationCard from '@/components/auth/InvitationCard.vue'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { InvitationDetailsResponseData } from '@/types/authentication.types'
import { useFetchInvitationDetailsQuery, useFetchInvitationWithTokenQuery } from '@/services/authentication.services'
import { handleApiError } from '@/helpers/error.helpers'
import { useRouter } from 'vue-router'


const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const isSmall = useMediaQuery('(max-width: 400px)')
const isDesktop = useMediaQuery('(min-width: 768px)')
const isScrollable = useMediaQuery('(max-width: 375px)')

const fetchDetailsQuery = !!$route.params.family_member_id ? useFetchInvitationDetailsQuery(
  {
    family_member_id: String($route.params.family_member_id),
    expires: String($route.query.expires),
    signature: String($route.query.signature),
  },
) : useFetchInvitationWithTokenQuery(
  String($route.query.token),
)

const loading = ref('')
const slotHeightPx = ref(72)
const viewportRef = ref<HTMLElement | null>(null)
const routeQuery = ref<Record<string, string | number> | null>(null)
const invitationDetails = ref<InvitationDetailsResponseData | null>(null)

const onAccept = () => {
  const signupDetails = {
    email: invitationDetails.value?.family_member.email,
    first_name: invitationDetails.value?.family_member.first_name,
    family_name: invitationDetails.value?.family_member.family_name,
  }
  if (isDesktop.value) {
    $router.push({
      name: 'Guests.OnboardingViewWeb',
      query: {
        family_member_id: String(routeQuery.value?.family_member_id),
        expires: String(routeQuery.value?.expires),
        signature: String(routeQuery.value?.signature),
        email_invite: Number(routeQuery.value?.email_invite),
        invitation_token: String(routeQuery.value?.invitation_token),
        ...signupDetails
      }
    })
  } else {
    $router.push({
      name: 'Guests.OnboardingSignup',
      params: { module: 'signup' },
      query: {
        family_member_id: String(routeQuery.value?.family_member_id),
        expires: String(routeQuery.value?.expires),
        signature: String(routeQuery.value?.signature),
        email_invite: Number(routeQuery.value?.email_invite),
        invitation_token: String(routeQuery.value?.invitation_token),
        ...signupDetails
      }
    })
  }
}
const onDecline = () => {
  message.success('Invitation declined successfully')
  if (isDesktop.value) {
    $router.push({
      name: 'Guests.OnboardingViewWeb'
    })
  } else {
    $router.push({
      name: 'Guests.OnboardingSignup',
      params: { module: 'signup' }
    })
  }
}

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

const resolveInviteQuery = async () => {
  const familyMemberId = $route.params.family_member_id
  if (familyMemberId) {
    await fetchInvitationDetails()
  } else {
    await fetchInvitationWithToken()
  }
}

const fetchInvitationDetails = async () => {
  loading.value += 'fetching'
  try {
    const res = await fetchDetailsQuery.refetch()
    invitationDetails.value = res.data?.data ?? null
    routeQuery.value = {
      family_member_id: String($route.params.family_member_id),
      expires: String($route.query.expires),
      signature: String($route.query.signature),
      email_invite: 0,
      invitation_token: String($route.query.invitation_token ?? '')
    }
  } catch (error) {
    handleApiError(error, message)
  } finally {
    loading.value = loading.value.replace('fetching', '')
  }
}

const fetchInvitationWithToken = async () => {
  loading.value += 'fetching'
  try {
    const res = await fetchDetailsQuery.refetch()
    invitationDetails.value = res.data?.data ?? null

    const registrationLink = invitationDetails.value?.signed_registration_url
    if (registrationLink) {
      const url = new URL(registrationLink)
      const queryParamsObject = Object.fromEntries(new URLSearchParams(url.search))
      routeQuery.value = {
        family_member_id: String(invitationDetails.value?.family_member.id),
        expires: String(queryParamsObject.expires),
        signature: String(queryParamsObject.signature),
        email_invite: 1,
        invitation_token: String(queryParamsObject.invitation_token)
      }
    }
  } catch (error) {
    handleApiError(error, message)
  } finally {
    loading.value = loading.value.replace('fetching', '')
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  nextTick(syncSlotHeight)
  window.addEventListener('resize', syncSlotHeight, { passive: true })
  // startWelcomeAnimation()
  document.addEventListener('visibilitychange', onVisibilityChange, { passive: true })
  startCarouselAutoScroll()

  await resolveInviteQuery()
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
