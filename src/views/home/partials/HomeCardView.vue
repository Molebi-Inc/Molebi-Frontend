<template>
  <div class="bg-[#F9FCFB]">
    <div class="sticky top-0 z-10 bg-white">
      <div class="flex justify-between items-center mb-6 mt-3 py-3">
        <BackButton label="" icon="vuesax.linear.arrow-left" class="mb-6" />
        <div>
          {{
            String($route.params.cardType)?.charAt(0).toUpperCase() +
            String($route.params.cardType)?.slice(1)
          }}
        </div>
        <div></div>
      </div>
    </div>
    <div>
      <component :is="properties.component" v-bind="properties.componentProps" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Component } from 'vue'
import { useRoute } from 'vue-router'
import type { Announcement } from '@/types/announcement.types'
import { useHome } from '@/composables/useHome'
import type { FamilyTradition } from '@/types/family-tradition.types'
import BackButton from '@/components/common/BackButton.vue'
import TraditionCard from '@/components/home/TraditionCard.vue'
import { useAnnouncementStore } from '@/stores/announcement.store'
import AnnouncementCard from '@/components/home/AnnouncementCard.vue'
import { useFamilyTraditionStore } from '@/stores/family-tradition.store'

const $route = useRoute()
const announcementStore = useAnnouncementStore()
const familyTraditionStore = useFamilyTraditionStore()
const { fetchAnnouncements, fetchFamilyTraditions } = useHome()

const announcements = computed<Announcement[]>(() => announcementStore.announcements)
const familyTraditions = computed<FamilyTradition[]>(() => familyTraditionStore.familyTraditions)

const properties = computed<{
  component: Component
  componentProps: Record<string, unknown>
}>(() => {
  const cardType = $route.params.cardType as 'announcement' | 'tradition'
  const config = {
    announcement: {
      component: AnnouncementCard,
      componentProps: {
        items: announcements.value,
        loading: announcementStore.loading,
      },
    },
    tradition: {
      component: TraditionCard,
      componentProps: {
        items: familyTraditions.value,
        loading: familyTraditionStore.loading,
      },
    },
  }[cardType]

  return (
    config || {
      loading: false,
      component: AnnouncementCard,
      componentProps: {},
    }
  )
})

onMounted(() => {
  fetchAnnouncements()
  fetchFamilyTraditions()
})
</script>
