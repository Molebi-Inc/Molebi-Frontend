<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import heroBannerMemories from '@/assets/images/hero_banner_memories.png'
import heroBannerTimeCapsule from '@/assets/images/hero_banner_time_capsule.png'
import heroBannerCulture from '@/assets/images/hero_banner_culture.png'
import frameBgGreen from '@/assets/backgrounds/frame-bg-green.png'
import frameBgWhite from '@/assets/backgrounds/frame-bg-white.png'

type BannerEvent = 'try-now' | 'add-relative' | 'explore-culture'

interface Banner {
  title: string
  subtitle: string
  cta: string
  textColor: string
  image: { src: string; alt: string }
  event: BannerEvent
}

const banners: Banner[] = [
  {
    title: "Don’t let your family memories disappear",
    subtitle:
      "From weddings to naming ceremonies and old pictures on your phone, keep everything safe in one place for the next generation",
    cta: "Try It Now",
    textColor: "white",
    image: {
      src: heroBannerMemories, alt: "Family memories"
    },
    event: "try-now",
  },
  {
    title: "Send a message to the future for you or your children",
    subtitle:
      "A message, advice, prayer, or secret your children, your spouse, or grandchildren will receive in the future",
    cta: "Try Time Capsule Now",
    textColor: "primary-900",
    image: { src: heroBannerTimeCapsule, alt: "Time capsule" },
    event: "add-relative",
  },
  {
    title: "Know more about your traditions and culture",
    subtitle:
      "Learn about your family’s customs, traditions, hometown, history and heritage in a way that is fun and easy to share",
    cta: "Explore your Tradition Now",
    textColor: "white",
    image: { src: heroBannerCulture, alt: "Culture" },
    event: "explore-culture",
  },
]

const emit = defineEmits<{
  (e: BannerEvent): void
}>()

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval>

const currentBanner = computed(() => banners[currentIndex.value]!)

const currentBackgroundImage = computed(() => {
  // Odd element position (1st, 3rd, ...) => green. Even positions => white.
  return currentIndex.value % 2 === 0
    ? frameBgGreen
    : frameBgWhite
})

const isEvenBannerIndex = computed(() => currentIndex.value % 2 === 0)

const advance = () => {
  currentIndex.value = (currentIndex.value + 1) % banners.length
}

onMounted(() => {
  timer = setInterval(advance, 4500)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="relative rounded-2xl">
    <Transition name="banner-fade" mode="out-in">
      <div :key="currentIndex"
        class="relative flex items-stretch w-full min-h-[170px] sm:min-h-[190px] md:min-h-[210px] rounded-[32px] overflow-hidden px-5 sm:px-8 md:px-12 py-4"
        :style="{ backgroundImage: `url(${currentBackgroundImage})`, backgroundSize: '100% 100%' }">
        <!-- Left: text content -->
        <div class="flex-1 py-8 md:py-10 flex flex-col justify-center gap-3 z-10 max-w-[600px]">
          <h2 :class="`text-${currentBanner.textColor} font-semibold text-[11px] md:text-2xl leading-snug`">
            {{ currentBanner.title }}
          </h2>
          <p :class="`text-${currentBanner.textColor} text-[7px] md:text-base leading-relaxed max-w-[520px]`">
            {{ currentBanner.subtitle }}
          </p>
          <button
            class="self-start mt-2 text-white text-[7px] md:text-sm md:font-semibold px-5 py-1 md:py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer whitespace-nowrap h-[19px] md:h-auto"
            :class="!isEvenBannerIndex ? 'bg-primary-700 hover:bg-primary-800' : 'bg-secondary-400 hover:bg-secondary-500'"
            @click="emit(currentBanner.event)">
            {{ currentBanner.cta }}
          </button>
        </div>

        <!-- Right: photo -->
        <div class="shrink-0 w-[130px] sm:w-[260px] md:w-[360px]">
          <img
            class="object-cover absolute top-0 -right-px w-[160px] h-[124px] sm:w-[220px] sm:h-[160px] md:w-[300px] md:h-[210px] rounded-[16px] sm:rounded-[20px] md:rounded-[24px]"
            style="transform: rotate(8deg); transform-origin: top right;" :src="currentBanner.image.src"
            :alt="currentBanner.image.alt" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 0.45s ease;
}

.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
}
</style>