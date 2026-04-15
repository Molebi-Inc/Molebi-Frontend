<template>
    <div class="pt-8 px-6 h-screen overflow-hidden flex flex-col bg-brand-green">
        <header v-if="isDesktop" class="shrink-0">
            <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
        </header>
        <div class="flex-1 min-h-0 grid grid-rows-2 gap-4">
            <div class="flex flex-col items-center justify-end overflow-hidden">
                <!-- <img src="@/assets/svg/tree-3.svg" alt="Molebi Tree" class="w-30 h-30" /> -->
                <img src="@/assets/gifs/welcome_page.gif" alt="Molebi Tree" class="w-[345px] h-[257px]" />
            </div>
            <div class="flex flex-col items-center justify-between py-8 overflow-hidden">
                <div ref="viewportRef" class="scroll-text-viewport">
                    <div class="scroll-text-strip"
                        :style="{ transform: `translateY(-${currentIndex * slotHeightPx}px)` }">
                        <p v-for="(text, i) in renderTexts" :key="i" class="scroll-text-line"
                            :class="{ 'scroll-text-current': i === currentIndex, 'scroll-text-next': i === nextIndex }">
                            {{ text }}
                        </p>
                    </div>
                </div>
                <div class="w-full flex flex-col items-center gap-3">
                    <MlbButton v-if="hasFinishedScrolling" label="Let’s get started" block
                        class="md:w-[35%]! w-full! bg-primary! text-white! rounded-xl! h-13! heartbeat"
                        @click="nextAction()" />
                    <MlbButton v-if="!hasFinishedScrolling" label="Skip"
                        class="md:w-[25%]! w-full! bg-primary-100! text-primary-900! rounded-3xl! h-13! border-primary!"
                        @click="nextAction()" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import MlbButton from '@/components/ui/MlbButton.vue'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const $router = useRouter()
const isDesktop = useMediaQuery('(min-width: 768px)')

const scrollTexts = [
    "Welcome to Molebi",
    "In many families, histories are passed by word of mouth.",
    " When elders are gone, those histories can disappear too.",
    "Molebi helps you keep your family history safe.",
    "You can gather your relatives in one place and see how everyone is connected.",
    "Save names, photos, memories, and important information before they are forgotten.",
    "Even family members living far away can be part of it.",
    "So your children and future generations will always know where they come from.",
    "Let’s start building your family tree.",
]

const intervalMs = 4500

const viewportRef = ref<HTMLElement | null>(null)
const slotHeightPx = ref(72)

const currentIndex = ref(0)
const nextIndex = computed(() => currentIndex.value + 1)
const renderTexts = computed(() => [...scrollTexts, ''])
const hasFinishedScrolling = computed(() => currentIndex.value >= scrollTexts.length - 1)

let intervalId: ReturnType<typeof setInterval> | null = null

const syncSlotHeightFromCss = () => {
    const el = viewportRef.value
    if (!el) return
    const raw = getComputedStyle(el).getPropertyValue('--slot-h').trim()
    const parsed = Number.parseFloat(raw)
    if (Number.isFinite(parsed) && parsed > 0) slotHeightPx.value = parsed
}

const advance = () => {
    if (currentIndex.value >= scrollTexts.length - 1) {
        if (intervalId) clearInterval(intervalId)
        intervalId = null
        return
    }

    currentIndex.value += 1
}

const nextAction = () => {
    if (isDesktop.value) {
        $router.push({ name: 'Guests.OnboardingViewWeb' })
    } else {
        $router.push({ name: 'Guests.LandingView', params: { module: 'welcome' } })
    }
}

onMounted(() => {
    nextTick(() => {
        syncSlotHeightFromCss()
    })
    window.addEventListener('resize', syncSlotHeightFromCss, { passive: true })
    intervalId = setInterval(advance, intervalMs)
})

onUnmounted(() => {
    window.removeEventListener('resize', syncSlotHeightFromCss)
    if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
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

.heartbeat {
    animation: heartbeat 3.4s ease-in-out infinite;
}

@keyframes heartbeat {
    0% {
        transform: scale(1);
    }

    12% {
        transform: scale(1.06);
    }

    24% {
        transform: scale(1);
    }

    36% {
        transform: scale(1.03);
    }

    48% {
        transform: scale(1);
    }

    100% {
        transform: scale(1);
    }
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
</style>