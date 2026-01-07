<template>
  <div
    class="col-span-1 bg-white md:border border-primary-400 rounded-2xl md:pb-6 md:px-6 pt-0 h-[275px] md:overflow-y-auto"
  >
    <div class="md:mt-3 bg-white"></div>
    <div
      class="sticky top-0 bg-white z-10 pt-6 -mx-6 px-6 mb-3 md:mb-8 flex justify-between items-center"
    >
      <div v-if="isLargeScreen"></div>
      <h4 :id="properties.id" class="text-gray-600 mb-0 font-medium uppercase tracking-wider">
        {{ properties.title }}
      </h4>
      <MlbButton
        :id="
          isLargeScreen && card_type === 'announcement'
            ? 'home-tour-step-4'
            : isLargeScreen && card_type === 'tradition'
              ? 'home-tour-step-5'
              : ''
        "
        text
        class="font-bold!"
        :label="isLargeScreen ? 'Add' : 'See all'"
        @click="isLargeScreen ? handleAddOption() : handleSeeAll()"
      />
    </div>
    <div>
      <div v-if="card_type === 'tradition'" class="flex justify-evenly items-center mb-4">
        <button
          v-for="tab in ['Upcoming', 'Past']"
          :key="tab"
          @click="setActiveTab(tab)"
          :class="[
            'text-sm font-medium pb-2 border-b-2 transition-colors cursor-pointer',
            activeTab === tab
              ? 'text-gray-900 border-green-500'
              : 'text-gray-400 border-transparent',
          ]"
        >
          {{ tab }}
        </button>
      </div>
    </div>
    <component :is="properties.component" v-bind="properties.componentProps" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import MlbButton from '@/components/ui/MlbButton.vue'
import type { Announcement } from '@/types/announcement.types'
import TraditionCard from '@/components/home/TraditionCard.vue'
import AnnouncementCard from '@/components/home/AnnouncementCard.vue'
import { useFamilyTraditionStore } from '@/stores/family-tradition.store'
import type { FamilyTradition, FamilyTraditionTab } from '@/types/family-tradition.types'

const $router = useRouter()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const familyTraditionStore = useFamilyTraditionStore()

const props = withDefaults(
  defineProps<{
    items: Array<Announcement | FamilyTradition>
    card_type: 'announcement' | 'tradition'
    loading: boolean
  }>(),
  {
    items: () => [],
    loading: false,
  },
)
const $emit = defineEmits<{
  (e: 'add-option', card_type: 'announcement' | 'family_tradition'): void
}>()

const handleAddOption = () => {
  $emit('add-option', props.card_type === 'tradition' ? 'family_tradition' : 'announcement')
}

const handleSeeAll = () => {
  $router.push({ name: 'App.HomeCardView', params: { cardType: props.card_type } })
}

const activeTab = ref<FamilyTraditionTab>('Upcoming')

const setActiveTab = (tab: string) => {
  activeTab.value = tab as FamilyTraditionTab
  familyTraditionStore.setStoreProp('path', tab)
}

const properties = computed<{
  id: string
  title: string
  description: string
  icon: string
  loading: boolean
  component: Component
  componentProps: Record<string, unknown>
}>(() => {
  return {
    announcement: {
      id: 'home-tour-step-2',
      title: 'Announcement',
      description: 'Announcement',
      icon: 'vuesax.linear.announcement',
      loading: props.loading,
      component: AnnouncementCard,
      componentProps: {
        items: isLargeScreen.value
          ? (props.items as Announcement[])
          : (props.items as Announcement[]).slice(0, 1),
        loading: props.loading,
      },
    },
    tradition: {
      id: 'home-tour-step-3',
      title: 'Family Tradition',
      description: 'Family Tradition',
      icon: 'vuesax.linear.family-tradition',
      loading: props.loading,
      component: TraditionCard,
      componentProps: {
        items: props.items as FamilyTradition[],
        loading: props.loading,
      },
    },
  }[props.card_type]
})
</script>
