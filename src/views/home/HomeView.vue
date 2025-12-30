<template>
  <section>
    <!-- Scroll Content -->
    <div class="flex-1">
      <div class="md:p-8 space-y-8">
        <!-- Did you know card -->
        <!-- <div class="w-full">
          <img
            v-if="isLargeScreen"
            src="@/assets/images/welcome-banner.png
          "
            alt="Did you know?"
            class="w-full h-full"
          />
          <img
            v-else
            src="@/assets/images/welcome-banner-small.png"
            alt="Did you know?"
            @click="$router.push({ name: 'App.HeritageView' })"
          />
        </div> -->
        <div
          v-if="heritageData"
          :style="bannerBackgroundStyle"
          class="w-full h-[91px] md:h-[158px] bg-contain bg-no-repeat md:bg-cover md:px-[56px] px-4 md:py-[28px] py-2"
        >
          <VerticalTextScroller
            :data="{
              community_name: String(heritageData?.community_name || 'No information available'),
              about: String(heritageData?.about || 'No information available'),
              population: String(heritageData?.population || 'No information available'),
              geographic_info: String(heritageData?.geographic_info || 'No information available'),
              traditional_rulers: String(heritageData?.traditional_rulers || ''),
              history: String(heritageData?.history || 'No information available'),
              economy: String(heritageData?.economy || 'No information available'),
            }"
            :community="String(heritageData?.community_name)"
          />
        </div>

        <div class="grid md:grid-cols-5 gap-4 items-stretch">
          <div class="md:col-span-4">
            <GrowthStageCard
              class="h-full"
              :stage-title="growthStage.stageTitle"
              :next-stage="growthStage.nextStage"
              :description="growthStage.description"
              :tasks="growthStage.tasks"
            />
          </div>
          <!-- <div class="md:flex flex-col h-full">
            <p class="text-sm text-gray-600 mb-2">Gender Distribution</p>
            <div ref="genderChartContainer" class="flex-1">
              <GenderChart
                :men="menCount"
                :women="womenCount"
                :direction="isLargeScreen ? 'vertical' : 'horizontal'"
                :height="isLargeScreen ? chartHeight : 100"
                :width="!isLargeScreen ? chartWidth : 200"
              />
            </div>
          </div> -->
          <div class="md:flex flex-col h-full">
            <div
              class="cursor-pointer border border-dashed border-gray-500 text-primary-900 rounded-2xl p-1 text-center h-full flex flex-col"
              @click="
                $router.push({ name: 'App.FamilyTreeView', params: { module: 'add-member' } })
              "
            >
              <div
                class="p-6 bg-[#D4EFD48C] rounded-2xl hover:bg-[#D4EFD4] transition-colors flex-1 flex flex-col justify-center"
              >
                <div class="text-4xl mb-2 text-primary-700 rounded-full p-2 bg-primary-50">
                  <MlbIcon name="vuesax.linear.add" />
                </div>
                <p class="font-semibold">FAMILY MEMBER</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
          <!-- Announcement and Family Tradition -->
          <HomeCardWrapper
            :items="announcements"
            card_type="announcement"
            :loading="announcementStore.loading"
            @add-option="handleHomeFormModal"
          />

          <!-- Family Tradition Card -->
          <HomeCardWrapper
            :items="familyTraditions"
            card_type="tradition"
            :loading="familyTraditionStore.loading"
            @add-option="handleHomeFormModal"
          />

          <!-- Right Sidebar -->
          <!-- <div class="hidden md:block col-span-1 space-y-4">
            <div
              :id="isLargeScreen ? 'home-tour-step-4' : ''"
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
              :id="isLargeScreen ? 'home-tour-step-5' : ''"
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
          </div> -->
        </div>
      </div>
    </div>
  </section>
  <MlbModal
    v-model:show="showHomeFormModal"
    class="rounded-3xl!"
    :bottom-sheet="!isLargeScreen"
    :bottom-sheet-height="662"
    @close="handleCloseForm"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <BackButton
            :label="isLargeScreen ? 'Go Back' : 'Cancel'"
            :icon="isLargeScreen ? 'vuesax.linear.arrow-left' : ''"
            class="mb-6"
            :previous-route="false"
            @update:go-back="handleCloseForm(true)"
          />
        </div>
        <div>
          <h1 class="text-base font-bold text-gray-900 text-center md:hidden">
            {{ homeForm?.title }}
          </h1>
        </div>
        <div></div>
      </div>
    </template>

    <h1 class="text-2xl font-bold text-gray-900 text-center mb-11 hidden md:block">
      {{ homeForm?.title }}
    </h1>
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
import { useTourStore } from '@/stores/tour'
import { useMediaQuery } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useTour } from '@/composables/useTour'
import { useHome } from '@/composables/useHome'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useProfileStore } from '@/stores/profile.store'
import { ref, computed, h, watch, onMounted, onUnmounted, nextTick } from 'vue'
import BackButton from '@/components/common/BackButton.vue'
import type { Announcement } from '@/types/announcement.types'
import { useAnnouncementStore } from '@/stores/announcement.store'
import GrowthStageCard from '@/components/home/GrowthStageCard.vue'
import HomeCardWrapper from '@/components/home/HomeCardWrapper.vue'
import AnnouncementForm from '@/components/home/AnnoucementForm.vue'
import type { FamilyTradition } from '@/types/family-tradition.types'
import { useFamilyTraditionStore } from '@/stores/family-tradition.store'
import FamilyTraditionForm from '@/components/home/FamilyTraditionForm.vue'
import FamilyTraditionMediaForm from '@/components/home/FamilyTraditionMediaForm.vue'
import type { FormType, HomeFormConfig } from '@/types/general.types'
import { useGetFamilyTreesQuery } from '@/services/family-tree.service'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { useGetHeritageQuery } from '@/services/heritage.services'
import { handleApiError } from '@/helpers/error.helpers'
import { useMessage } from 'naive-ui'
import VerticalTextScroller from '@/components/home/VerticalTextScroller.vue'
import type { HeritageDataInterface } from '@/types/heritage.types'
import welcomeBanner from '@/assets/images/welcome-banner.png'
import welcomeBannerSmall from '@/assets/images/welcome-banner-small.png'

const message = useMessage()
const heritageData = ref<HeritageDataInterface | null>(null)
const $route = useRoute()
const $router = useRouter()
const heritageQuery = useGetHeritageQuery()
const { startTour: startTourAction, tourIsComplete } = useTour()
const announcementStore = useAnnouncementStore()
const familyTreesQuery = useGetFamilyTreesQuery()
const familyTraditionStore = useFamilyTraditionStore()
const { fetchAnnouncements, fetchFamilyTraditions } = useHome()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const showHomeFormModal = ref<boolean>(false)
const showStartTourModal = ref<boolean>(false)
const familyMemberCounts = ref<{ men: number; women: number }>({ men: 0, women: 0 })
const genderChartContainer = ref<HTMLElement | null>(null)
const chartHeight = ref<number>(60)
const chartWidth = ref<number>(200)

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
      component: h(FamilyTraditionForm, { close: () => handleCloseForm(true) }),
    },
    family_tradition_media: {
      id: 3,
      name: 'family_tradition_media',
      title: 'Upload File',
      component: h(FamilyTraditionMediaForm),
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
  if (!show) return
  const query = { ...$route.query }
  if (query.ftype) delete query.ftype
  if (query.fid) delete query.fid
  $router.push({
    name: 'App.HomeView',
    query: query,
  })
}

const fetchFamilyMembers = async () => {
  const response = await familyTreesQuery.refetch()
  const familyTree = response.data?.data?.familyTree

  if (!familyTree) {
    familyMemberCounts.value = { men: 0, women: 0 }
    return
  }

  // Flatten all family member arrays into a single array
  const allMembers = [
    ...(familyTree.self ? [familyTree.self] : []),
    ...(familyTree.parents || []),
    ...(familyTree.siblings || []),
    ...(familyTree.spouse || []),
    ...(familyTree.children || []),
    ...(familyTree.grandparents || []),
    ...(familyTree.grandchildren || []),
    ...(familyTree.aunts_uncles || []),
    ...(familyTree.nieces_nephews || []),
    ...(familyTree.cousins || []),
  ].filter((member) => member != null) as Array<FamilyMemberInterface & { relationship?: string }>

  familyMemberCounts.value = {
    men: allMembers.length * 0.5,
    women: allMembers.length * 0.5,
  }
}

const homeForm = computed(() => {
  const ftype = $route.query.ftype
  const homeFormsMap = getHomeFormsMap()
  if (typeof ftype === 'string' && ftype in homeFormsMap) {
    return homeFormsMap[ftype as FormType]
  }
  return null
})

const bannerBackgroundStyle = computed(() => {
  const imagePath = isLargeScreen.value ? welcomeBanner : welcomeBannerSmall
  return {
    backgroundImage: `url(${imagePath})`,
  }
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

const updateChartHeight = () => {
  nextTick(() => {
    if (genderChartContainer.value) {
      const containerHeight = genderChartContainer.value.clientHeight
      chartHeight.value = containerHeight > 0 ? containerHeight : 60
    }
  })
}

const updateChartWidth = () => {
  nextTick(() => {
    if (genderChartContainer.value) {
      const containerWidth = genderChartContainer.value.clientWidth
      chartWidth.value = containerWidth > 0 ? containerWidth : 200
    }
  })
}

const fetchHeritage = async () => {
  try {
    const response = await heritageQuery.refetch()
    heritageData.value = response.data?.data as unknown as HeritageDataInterface
  } catch (error) {
    handleApiError(error, message)
  }
}

onMounted(() => {
  fetchFamilyMembers()
  fetchAnnouncements()
  fetchFamilyTraditions()
  fetchHeritage()

  updateChartHeight()
  updateChartWidth()

  // Update height on window resize
  window.addEventListener('resize', updateChartHeight)
  window.addEventListener('resize', updateChartWidth)

  setTimeout(() => {
    if (tourIsComplete.value) return
    showStartTourModal.value = true
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartHeight)
  window.removeEventListener('resize', updateChartWidth)
})
</script>
