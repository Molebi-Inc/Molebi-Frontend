<template>
  <div v-if="userProfileLoading">
    <PageLoader />
  </div>
  <div v-else class="h-screen px-6 md:px-0">
    <header v-if="$route.meta.hasLayoutLogo" class="px-[72px] pt-[40px]">
      <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
    </header>
    <div class="flex">
      <aside
        v-if="isLargeScreen && $route.meta.fullScreen !== 'web'"
        class="fixed left-0 top-0 h-full z-40"
      >
        <SidebarComponent />
      </aside>
      <main
        :class="[
          'flex-1 h-full relative pb-24 md:pb-0 overflow-y-auto',
          isLargeScreen && !['web'].includes($route.meta.fullScreen as string) ? 'md:ml-64' : '',
        ]"
      >
        <div :class="['h-full', isLargeScreen ? 'p-6' : '']">
          <header
            v-if="
              (isLargeScreen && !['web'].includes($route.meta.fullScreen as string)) ||
              (!isLargeScreen && !['mobile'].includes($route.meta.fullScreen as string))
            "
          >
            <HeaderComponent />
          </header>
          <section
            :class="[
              'h-full',
              $route.meta.fullScreen === 'web' ? 'flex items-center justify-center' : '',
            ]"
          >
            <router-view />
          </section>
        </div>
        <FooterComponent v-if="!isLargeScreen && $route.meta.fullScreen !== 'mobile'" />
      </main>
    </div>
  </div>
  <img
    v-if="$route.meta.hasLayoutLeaf && isLargeScreen"
    src="@/assets/images/leaf.svg"
    alt="Molebi"
    class="absolute bottom-0 left-0 w-[347px] h-[454px]"
  />
  <MlbTour bg-color="white">
    <template #mlb-header="{ tour }">
      <h3 class="tour-card__title">{{ tour.steps[tour.currentStep].header?.title }}</h3>
    </template>
    <template #mlb-content="{ tour }">
      <span class="tour-card__body" v-html="tour.steps[tour.currentStep].content"></span>
    </template>
    <template #mlb-actions="{ tour }">
      <div class="mt-8 flex justify-between gap-4">
        <button class="v-step__button v-step__button-skip" @click="skipTour(tour)">Skip</button>
        <button class="v-step__button v-step__button-next" @click="nextStep(tour.isLast, tour)">
          {{ tour.isLast ? 'Finish' : 'Next' }}
        </button>
      </div>
    </template>
  </MlbTour>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useProfileStore } from '@/stores/profile.store'
import HeaderComponent from '@/components/common/HeaderComponent.vue'
import FooterComponent from '@/components/common/FooterComponent.vue'
import SidebarComponent from '@/components/common/SidebarComponent.vue'
import { useRoute } from 'vue-router'
import PageLoader from '@/components/common/PageLoader.vue'
import { useProfile } from '@/composables/useProfile'
import MlbTour from '@/components/ui/MlbTour.vue'
import { useTour } from '@/composables/useTour'

const $route = useRoute()
const profileStore = useProfileStore()
const { skipTour, nextStep } = useTour()
const { userProfileLoading, getProfile } = useProfile()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

onMounted(async () => {
  if (profileStore.user) {
    return
  }
  await getProfile()
})
</script>

<style scoped>
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
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  text-align: start;
}

.tour-card__body {
  color: #6b7280;
  font-size: 12px;
  font-weight: 400;
  margin-bottom: 32px;
  text-align: start;
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

:deep(.v-step__button) {
  min-width: 110px !important;
  height: 42px !important;
  border-radius: 999px !important;
  border: none !important;
  font-size: 0.95rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
}

:deep(.v-step__button:active) {
  transform: translateY(1px) !important;
}

:deep(.v-step__button-next) {
  background: #0d7c39 !important;
  color: #fff !important;
}

:deep(.v-step__button-skip) {
  background: #eef6ef !important;
  color: #0d7c39 !important;
}
</style>
