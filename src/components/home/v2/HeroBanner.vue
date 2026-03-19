<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

type BannerEvent = 'try-now' | 'add-relative' | 'explore-culture'

interface Banner {
  title: string
  subtitle: string
  cta: string
  textColor: string
  image: {
    src: string
    alt: string
  }//[]
  event: BannerEvent
}

const banners: Banner[] = [
  {
    title: "Don't let your family memories disappear",
    subtitle:
      'From weddings to naming ceremonies and old pictures on your phone, keep everything safe in one place for the next generation',
    cta: 'Try It Now',
    textColor: 'white',
    image: {
      src: '/src/assets/images/hero_banner_memories.png',
      alt: 'Hero Banner 1',
    },
    event: 'try-now',
  },
  {
    title: 'Send a message to the future for you or your children',
    subtitle:
      'A message, advice, prayer, or secret your children, your spouse, or grandchildren will receive in the future',
    cta: 'Try Time Capsule Now',
    textColor: 'primary-900',
    image: {
      src: '/src/assets/images/hero_banner_time_capsule.png',
      alt: 'Hero Banner 2',
    },
    event: 'add-relative',
  },
  {
    title: 'Know more about your traditions and culture',
    subtitle:
      "Learn about your family’s customs, traditions, hometown, history and heritage in a way that is fun and easy to share",
    cta: 'Explore your Tradition Now',
    textColor: 'white',
    image: {
      src: '/src/assets/images/hero_banner_culture.png',
      alt: 'Hero Banner 3',
    },
    event: 'explore-culture',
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
    ? '/src/assets/backgrounds/frame-bg-green.png'
    : '/src/assets/backgrounds/frame-bg-white.png'
})

const isEvenBannerIndex = computed(() => currentIndex.value % 2 === 0)

// const goTo = (index: number) => {
//   currentIndex.value = index
// }

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
        class="relative flex items-stretch w-full min-h-[190px] md:min-h-[210px] rounded-[32px] overflow-hidden px-8 md:px-12 py-4"
        :style="{ backgroundImage: `url(${currentBackgroundImage})`, backgroundSize: '100% 100%' }">
        <!-- Left: text content -->
        <div class="flex-1 py-8 md:py-10 flex flex-col justify-center gap-3 z-10 max-w-[600px]">
          <h2 :class="`text-${currentBanner.textColor} font-extrabold text-xl md:text-2xl leading-snug`">
            {{ currentBanner.title }}
          </h2>
          <p :class="`text-${currentBanner.textColor} text-sm md:text-base leading-relaxed max-w-[520px]`">
            {{ currentBanner.subtitle }}
          </p>
          <button
            class="self-start mt-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
            :class="!isEvenBannerIndex ? 'bg-primary-700 hover:bg-primary-800' : 'bg-secondary-400 hover:bg-secondary-500'"
            @click="emit(currentBanner.event)">
            {{ currentBanner.cta }}
          </button>
        </div>

        <!-- Right: photo collage -->
        <div class="relative hidden sm:block shrink-0 w-[340px] md:w-[420px]">
          <img class="object-cover absolute top-2 right-2 w-[250px] h-[165px] md:w-[310px] md:h-[205px] rounded-[22px]"
            style="transform: rotate(8deg); transform-origin: top right;" :src="currentBanner.image?.src"
            :alt="currentBanner.image?.alt" />
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