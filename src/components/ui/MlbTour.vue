<template>
  <div>
    <!-- Custom backdrop overlay -->
    <div v-if="isTourActive" class="tour-backdrop" @click.stop></div>
    <v-tour v-if="hasSteps" :name="tourName" :steps="steps" :options="tourOptions">
      <template #default="tour">
        <transition name="fade" appear mode="out-in">
          <v-step
            v-if="tour.steps[tour.currentStep]"
            :key="tour.currentStep"
            :step="tour.steps[tour.currentStep]"
            :previous-step="tour.previousStep"
            :next-step="tour.nextStep"
            :stop="tour.stop"
            :skip="tour.skip"
            :is-first="tour.isFirst"
            :is-last="tour.isLast"
            :labels="tour.labels"
            :highlight="tour.highlight"
          >
            <template #header>
              <slot :tour="tour" name="mlb-header"></slot>
            </template>
            <template #content>
              <slot :tour="tour" name="mlb-content"></slot>
            </template>
            <template #actions>
              <slot :tour="tour" name="mlb-actions"></slot>
            </template>
          </v-step>
        </transition>
      </template>
    </v-tour>
  </div>
</template>
<script setup lang="ts">
import { useTourStore } from '@/stores/tour'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = withDefaults(
  defineProps<{
    bgColor?: string
  }>(),
  {
    bgColor: '--color-primary-100',
  },
)

const $route = useRoute()

const tourStore = useTourStore()
const steps = computed(() => tourStore.getTourSteps?.tour_steps ?? [])

const tourOptions = {
  highlight: true,
}

const tourName = computed(() => {
  const metaTour = $route.meta.tour
  return typeof metaTour === 'string' ? metaTour : 'myTour'
})

const hasSteps = computed(() => steps.value && steps.value.length > 0)

// Track if tour is active by monitoring body class
const isTourActive = ref(false)

const checkTourActive = () => {
  isTourActive.value = document.body.classList.contains('v-tour--active')
}

let observer: MutationObserver | null = null

onMounted(() => {
  checkTourActive()
  // Watch for changes to body class
  observer = new MutationObserver(() => {
    checkTourActive()
  })
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>
<style scoped>
@import 'vue3-tour/dist/vue3-tour.css';

:deep(.v-step) {
  background-color: v-bind(
    'props?.bgColor?.includes("--") ? "var(" + props?.bgColor + ")" : props?.bgColor'
  );
  width: 300px;
  min-height: 169px;
  box-sizing: border-box;
  padding: 15px;
}

:deep(.v-step.v-step__header) {
  background-color: v-bind(
    'props?.bgColor?.includes("--") ? "var(" + props?.bgColor + ")" : props?.bgColor'
  );
  color: var(--shr-color-primary-lt-2);
}

:deep(.v-step.v-step__content) {
  color: var(--shr-color-primary-lt-2);
}

:deep(.v-step.v-step__arrow),
:deep(.v-step__arrow--dark::before) {
  background-color: v-bind(
    'props?.bgColor?.includes("--") ? "var(" + props?.bgColor + ")" : props?.bgColor'
  );
}

:deep(.v-step) {
  z-index: 9999;
  position: relative;
}

/* Custom backdrop overlay */
.tour-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.close--btn {
  position: absolute;
  top: 10px;
  left: 10px;
  color: var(--shr-color-primary-lt-2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
