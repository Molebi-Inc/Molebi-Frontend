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

        <!-- Reminders -->
        <div>
          <h3
            id="home-tour-step-4"
            class="text-gray-400 text-sm font-semibold uppercase mb-4 tracking-wider"
          >
            Reminders
          </h3>
          <div v-if="reminders.length > 0" class="relative overflow-auto">
            <!-- Left Scroll Button -->
            <button
              v-if="canScrollLeft"
              @click="scrollReminders('left')"
              class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <MlbIcon name="vuesax.linear.arrow-left" class="w-5 h-5 text-gray-700" />
            </button>

            <!-- Scrollable Container -->
            <div
              ref="remindersContainer"
              class="overflow-x-auto pb-4 mx-auto"
              :style="{ width: remindersContainerWidth }"
              style="scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9"
              @scroll="updateScrollButtons"
            >
              <div class="flex gap-4" :style="{ width: `${totalItemsWidth}px` }">
                <div
                  v-for="reminder in reminders"
                  :key="reminder.id"
                  class="shrink-0 bg-white rounded-lg p-4 w-40 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h4 class="font-semibold text-gray-900">{{ reminder.title }}</h4>
                  <p class="text-xs text-gray-500 mt-2">{{ reminder.date }}</p>
                </div>
              </div>
            </div>

            <!-- Right Scroll Button -->
            <button
              v-if="canScrollRight"
              @click="scrollReminders('right')"
              class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <MlbIcon name="vuesax.linear.arrow-left" class="w-5 h-5 text-gray-700 rotate-180" />
            </button>
          </div>
          <div v-else class="flex justify-center items-center h-full">
            <p class="text-gray-300 text-sm font-medium mb-4">
              No reminders yet, Your reminders will appear here
            </p>
          </div>
        </div>

        <!-- Announcement and Family Tradition -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Announcement Card -->
          <div class="col-span-1 bg-white border border-primary-400 rounded-2xl p-6">
            <h4
              id="home-tour-step-2"
              class="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider"
            >
              Announcement
            </h4>
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded"
                >High</span
              >
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Sunday Family Dinner</h3>
            <p class="text-sm text-gray-600 mb-4">
              Family gathering for a special dinner to share stories, laugh, and reconnect.
            </p>
            <div class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <div class="w-6 h-6 bg-blue-400 rounded-full border-2 border-white"></div>
                <div class="w-6 h-6 bg-pink-400 rounded-full border-2 border-white"></div>
                <div class="w-6 h-6 bg-purple-400 rounded-full border-2 border-white"></div>
              </div>
              <span class="text-xs text-gray-600">+3</span>
            </div>
            <p class="text-sm text-gray-600 mt-4">Every Sunday at 6:00 PM</p>
          </div>

          <!-- Family Tradition Card -->
          <div class="col-span-1 bg-white border border-primary-400 rounded-2xl p-6">
            <h4
              id="home-tour-step-3"
              class="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider"
            >
              Family Tradition
            </h4>
            <div class="flex gap-4 mb-6 border-b border-gray-200 pb-4">
              <button
                v-for="tab in ['Upcoming', 'Past']"
                :key="tab"
                @click="activeTab = tab"
                :class="[
                  'text-sm font-medium pb-2 border-b-2 transition-colors',
                  activeTab === tab
                    ? 'text-gray-900 border-green-500'
                    : 'text-gray-400 border-transparent',
                ]"
              >
                {{ tab }}
              </button>
            </div>
            <div class="text-center py-8">
              <p class="text-gray-500 text-sm mb-2">You don't have a family tradition yet?</p>
              <p class="text-gray-400 text-sm mb-4">Let's start one!</p>
              <p class="text-gray-400 text-xs">Click the announcement button to start</p>
            </div>
          </div>

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

        <GrowthStageCard
          class="mt-6"
          :stage-title="growthStage.stageTitle"
          :next-stage="growthStage.nextStage"
          :description="growthStage.description"
          :tasks="growthStage.tasks"
        />
      </div>
    </div>
  </section>
  <MlbModal v-model:show="showHomeFormModal" class="rounded-3xl!">
    <template #header>
      <div>
        <BackButton icon="vuesax.linear.arrow-left" class="mb-6" />
      </div>
    </template>

    <h1 class="text-2xl font-bold text-gray-900 text-center mb-11">{{ homeForm?.title }}</h1>
    <component :is="homeForm?.component" :key="$route.query.ftype" />
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
import { ref, computed, h, watch, onMounted, onUnmounted } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import BackButton from '@/components/common/BackButton.vue'
import AnnouncementForm from '@/components/home/AnnoucementForm.vue'
import FamilyTraditionForm from '@/components/home/FamilyTraditionForm.vue'
import FamilyTraditionMediaForm from '@/components/home/FamilyTraditionMediaForm.vue'
import GrowthStageCard from '@/components/home/GrowthStageCard.vue'
import { useTour } from '@/composables/useTour'

interface Reminder {
  id: number
  title: string
  date: string
}

const $route = useRoute()
const $router = useRouter()
const showHomeFormModal = ref<boolean>(false)
const showStartTourModal = ref<boolean>(false)
// const showFamilyTraditionModal = ref(false)
const activeTab = ref<string>('Upcoming')
const reminders: Reminder[] = [
  { id: 1, title: 'Family Games Night', date: 'March 01, 2021' },
  { id: 2, title: 'Christmas Eve', date: 'March 01, 2021' },
  { id: 3, title: 'New year Dinner', date: 'March 01, 2021' },
  { id: 4, title: 'New year Dinner', date: 'March 01, 2021' },
  { id: 5, title: 'New year Dinner', date: 'March 01, 2021' },
]

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

// Reminders scroll functionality
const remindersContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const isLargeScreen = useMediaQuery('(min-width: 768px)')

// Calculate visible container width based on screen size (shows 2 on small, 7 on large)
const remindersContainerWidth = computed(() => {
  const itemWidth = 160 // w-40 = 10rem = 160px
  const gap = 16 // gap-4 = 1rem = 16px
  const itemsToShow = isLargeScreen.value ? 7 : 2
  const totalWidth = itemsToShow * itemWidth + (itemsToShow - 1) * gap
  return `${totalWidth}px`
})

// Calculate total width needed for all items
const totalItemsWidth = computed(() => {
  const itemWidth = 160 // w-40
  const gap = 16 // gap-4
  const totalWidth = reminders.length * itemWidth + (reminders.length - 1) * gap
  return totalWidth
})

// Scroll amount per click (one item width + gap)
const scrollAmount = computed(() => {
  const itemWidth = 160 // w-40
  const gap = 16 // gap-4
  return itemWidth + gap
})

const scrollReminders = (direction: 'left' | 'right') => {
  if (!remindersContainer.value) return

  const currentScroll = remindersContainer.value.scrollLeft
  const scrollTo =
    direction === 'left' ? currentScroll - scrollAmount.value : currentScroll + scrollAmount.value

  remindersContainer.value.scrollTo({
    left: scrollTo,
    behavior: 'smooth',
  })
}

const updateScrollButtons = () => {
  if (!remindersContainer.value) return

  const { scrollLeft, scrollWidth, clientWidth } = remindersContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
}

onMounted(() => {
  // Use nextTick to ensure DOM is fully rendered
  setTimeout(() => {
    updateScrollButtons()
    window.addEventListener('resize', updateScrollButtons)
    if (remindersContainer.value) {
      remindersContainer.value.addEventListener('scroll', updateScrollButtons)
    }
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollButtons)
  if (remindersContainer.value) {
    remindersContainer.value.removeEventListener('scroll', updateScrollButtons)
  }
})

watch(isLargeScreen, () => {
  // Update scroll buttons when screen size changes
  setTimeout(updateScrollButtons, 100)
})

// const handleAnnouncementSubmit = (data: AnnouncementFormValues) => {
//   console.log('Announcement data:', data)
//   showAnnouncementModal.value = false
// }

type FormType = 'announcement' | 'family_tradition' | 'family_tradition_media'

interface HomeFormConfig {
  id: number
  name: FormType
  title: string
  component: any
}

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

const handleHomeFormModal = (name: string) => {
  $router.push({
    name: 'App.HomeView',
    query: {
      ftype: name,
    },
  })
}

const handleCloseForm = () => {
  delete $route.query.ftype
  delete $route.query.fid
  $router.push({
    name: 'App.HomeView',
    ...$route.query,
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
    console.log('newVal', newVal)
    if (newVal) {
      showHomeFormModal.value = true
    } else {
      showHomeFormModal.value = false
    }
  },
  { immediate: true },
)

const { startTour: startTourAction } = useTour()

const startTour = () => {
  const tourName = ($route.meta.tour as string) || 'myTour'
  startTourAction(tourName)
  showStartTourModal.value = false
}

onMounted(() => {
  setTimeout(() => {
    showStartTourModal.value = true
  }, 100)
})
</script>
