<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useTourStore } from '@/stores/tour'
import MlbAlert from '@/components/ui/MlbAlert.vue'
import { NConfigProvider, NMessageProvider, NNotificationProvider, NDialogProvider } from 'naive-ui'

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

const themeOverrides = {}
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <NDialogProvider>
      <NMessageProvider>
        <NNotificationProvider>
          <RouterView />
          <MlbAlert />

          <v-tour :name="tourName" :steps="steps" :options="tourOptions">
            <template
              #default="{ currentStep, steps: slotSteps, nextStep, skip, finish, isFirst, isLast }"
            >
              <div v-if="slotSteps[currentStep]" class="tour-overlay">
                <div class="tour-card">
                  <div class="tour-card__content">
                    <p class="tour-card__eyebrow" v-if="!isFirst">
                      {{ currentStep + 1 }}/{{ slotSteps.length }}
                    </p>
                    <h3 class="tour-card__title">
                      {{ slotSteps[currentStep].header?.title }}
                    </h3>
                    <p class="tour-card__body" v-html="slotSteps[currentStep].content"></p>
                  </div>

                  <div class="tour-card__actions">
                    <button class="tour-btn tour-btn--ghost" @click="skip">Skip</button>
                    <button
                      class="tour-btn tour-btn--primary"
                      @click="isLast ? finish() : nextStep()"
                    >
                      {{ isFirst ? 'Start Tour' : isLast ? 'Finish' : 'Next' }}
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </v-tour>
        </NNotificationProvider>
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<style scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background: rgba(12, 32, 24, 0.25);
  z-index: 9999;
  padding: 1.5rem;
}

.tour-card {
  width: min(420px, 100%);
  background: #fff;
  border-radius: 24px;
  padding: 2rem 2rem 1.25rem;
  box-shadow: 0 25px 60px rgba(10, 36, 20, 0.15);
}

.tour-card__eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.tour-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.tour-card__body {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.55;
}

.tour-card__content :deep(ul) {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
}

.tour-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.tour-btn {
  min-width: 110px;
  height: 42px;
  border-radius: 999px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.tour-btn:active {
  transform: translateY(1px);
}

.tour-btn--primary {
  background: #0d7c39;
  color: #fff;
  box-shadow: 0 10px 20px rgba(13, 124, 57, 0.35);
}

.tour-btn--ghost {
  background: #eef6ef;
  color: #0d7c39;
}
</style>
