<template>
  <section>
    <!-- Scroll Content -->
    <div class="flex-1">
      <div class="md:p-8 space-y-8">
        <!-- Did you know card -->
        <div class="w-full">
          <img
            src="@/assets/images/welcome-banner.png"
            alt="Did you know?"
            class="w-[346px] md:w-full h-auto md:h-full"
          />
        </div>

        <GrowthStageCard
          class="mt-6"
          :stage-title="growthStage.stageTitle"
          :next-stage="growthStage.nextStage"
          :description="growthStage.description"
          :tasks="growthStage.tasks"
        />

        <!-- Reminders -->
        <div>
          <ReminderContainer :reminders="reminders" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Announcement and Family Tradition -->
          <HomeCardWrapper
            :items="announcements"
            card_type="announcement"
            :loading="announcementStore.loading"
          />

          <!-- Family Tradition Card -->
          <HomeCardWrapper
            :items="familyTraditions"
            card_type="tradition"
            :loading="familyTraditionStore.loading"
          />

          <!-- Right Sidebar -->
          <div class="col-span-1 space-y-4">
            <div
              id="home-tour-step-5"
              class="cursor-pointer border border-dashed border-gray-500 text-white rounded-2xl p-1 text-center"
              @click="handleHomeFormModal('announcement')"
            >
              <div class="p-6 bg-primary-700 rounded-2xl hover:bg-primary-800 transition-colors">
                <div class="text-4xl mb-2">
                  <MlbIcon name="vuesax.broke.add-square" />
                </div>
                <p class="font-semibold">ANNOUNCEMENT</p>
              </div>
            </div>
            <div
              id="home-tour-step-6"
              class="cursor-pointer border border-dashed border-gray-500 text-primary-900 rounded-2xl p-1 text-center"
              @click="handleHomeFormModal('family_tradition')"
            >
              <div class="p-6 bg-[#D4EFD48C] rounded-2xl hover:bg-[#D4EFD4] transition-colors">
                <div class="text-4xl mb-2">
                  <MlbIcon name="vuesax.broke.add-square.svg" />
                </div>
                <p class="font-semibold">FAMILY TRADITION</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <MlbModal v-model:show="showHomeFormModal" class="rounded-3xl!" @close="handleCloseForm">
    <template #header>
      <div>
        <BackButton icon="vuesax.linear.arrow-left" class="mb-6" :previous-route="false" />
      </div>
    </template>

    <h1 class="text-2xl font-bold text-gray-900 text-center mb-11">{{ homeForm?.title }}</h1>
    <component :is="homeForm?.component" :key="$route.query.ftype" @close="handleCloseForm" />
  </MlbModal>
  <MlbModal v-model:show="showStartTourModal" class="rounded-3xl!">
    <template #header> Welcome to Molebi! </template>
    <span>
      A growing digital tree where your family’s stories, memories, and legacies live together.
      Let’s take a 30-seconds tour!</span
    >
    <template #footer>
      <div class="flex justify-end gap-2">
        <MlbButton
          label="Start Tour"
          class="rounded-lg! bg-primary-700! text-white! border-none! h-10!"
          @click="startTour"
        />
        <MlbButton
          label="Skip"
          class="rounded-lg! bg-primary-50! text-primary-900! border-none! h-10!"
          @click="showStartTourModal = false"
        />
      </div>
    </template>
  </MlbModal>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useTour } from '@/composables/useTour'
import { useHome } from '@/composables/useHome'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import type { Reminder } from '@/types/reminder.types'
import { ref, computed, h, watch, onMounted } from 'vue'
import { useReminderStore } from '@/stores/reminder.store'
import BackButton from '@/components/common/BackButton.vue'
import type { Announcement } from '@/types/announcement.types'
import { useAnnouncementStore } from '@/stores/announcement.store'
import GrowthStageCard from '@/components/home/GrowthStageCard.vue'
import HomeCardWrapper from '@/components/home/HomeCardWrapper.vue'
import AnnouncementForm from '@/components/home/AnnoucementForm.vue'
import type { FormType, HomeFormConfig } from '@/types/general.types'
import type { FamilyTradition } from '@/types/family-tradition.types'
import ReminderContainer from '@/components/home/ReminderContainer.vue'
import { useFamilyTraditionStore } from '@/stores/family-tradition.store'
import FamilyTraditionForm from '@/components/home/FamilyTraditionForm.vue'
import FamilyTraditionMediaForm from '@/components/home/FamilyTraditionMediaForm.vue'
import { useTourStore } from '@/stores/tour'
import { useProfileStore } from '@/stores/profile.store'

const $route = useRoute()
const $router = useRouter()
const profileStore = useProfileStore()
const reminderStore = useReminderStore()
const { startTour: startTourAction } = useTour()
const announcementStore = useAnnouncementStore()
const familyTraditionStore = useFamilyTraditionStore()
const { fetchAnnouncements, fetchFamilyTraditions } = useHome()

const showHomeFormModal = ref<boolean>(false)
const showStartTourModal = ref<boolean>(false)
const tourStore = useTourStore()
const steps = computed(() => tourStore.getTourSteps?.tour_steps ?? [])

const growthStage = ref({
  stageTitle: 'Seedling Stage',
  nextStage: 'Sapling',
  description:
    'You are currently in the seedling stage, keep growing your family by completing the tasks below.',
  tasks: [
    {
      id: 'members',
      label: 'Add 1 family member',
      value: 0,
      goal: 1,
      icon: 'vuesax.linear.profile-2user',
    },
    {
      id: 'traditions',
      label: 'Add 1 tradition',
      value: 0,
      goal: 1,
      icon: 'vuesax.linear.sparkle',
    },
    { id: 'memories', label: 'Add 1 memory', value: 0, goal: 1, icon: 'vuesax.linear.camera' },
  ],
})

const reminders = computed<Reminder[]>(() => reminderStore.reminders)
const announcements = computed<Announcement[]>(() => announcementStore.announcements)
const familyTraditions = computed<FamilyTradition[]>(() => familyTraditionStore.familyTraditions)

const getHomeFormsMap = (): Record<FormType, HomeFormConfig> => {
  const isEditMode = !!$route.query.fid
  return {
    announcement: {
      id: 1,
      name: 'announcement',
      title: isEditMode ? 'Edit Announcement' : 'New Announcement',
      component: h(AnnouncementForm, { close: () => handleCloseForm }),
    },
    family_tradition: {
      id: 2,
      name: 'family_tradition',
      title: isEditMode ? 'Edit Family Tradition' : 'New Family Tradition',
      component: h(FamilyTraditionForm, { close: () => handleCloseForm }),
    },
    family_tradition_media: {
      id: 3,
      name: 'family_tradition_media',
      title: 'Upload File',
      component: h(FamilyTraditionMediaForm, { close: () => handleCloseForm }),
    },
  }
}

const startTour = () => {
  const tourName = ($route.meta.tour as string) || 'myTour'
  startTourAction(tourName)
  showStartTourModal.value = false
}

const handleHomeFormModal = (name: string) => {
  $router.push({
    name: 'App.HomeView',
    query: {
      ftype: name,
    },
  })
}

const handleCloseForm = (show?: boolean) => {
  console.log('show', show)
  if (!show) return
  const query = { ...$route.query }
  if (query.ftype) delete query.ftype
  if (query.fid) delete query.fid
  $router.push({
    name: 'App.HomeView',
    query: query,
  })
}

const homeForm = computed(() => {
  const ftype = $route.query.ftype
  const homeFormsMap = getHomeFormsMap()
  if (typeof ftype === 'string' && ftype in homeFormsMap) {
    return homeFormsMap[ftype as FormType]
  }
  return null
})

watch(
  () => $route.query.ftype,
  (newVal) => {
    if (newVal) {
      showHomeFormModal.value = true
    } else {
      showHomeFormModal.value = false
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchAnnouncements()
  fetchFamilyTraditions()

  setTimeout(() => {
    const tourStage = profileStore?.userDetails?.tour_stage
    if (tourStage !== undefined && tourStage >= steps.value.length) return
    showStartTourModal.value = true
  }, 100)
})
</script>
