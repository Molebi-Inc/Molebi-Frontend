<template>
  <nav class="md:hidden fixed left-1/2 bottom-0 z-30 w-[92%] -translate-x-1/2">
    <div class="relative">
      <div
        class="absolute left-1/2 -translate-x-1/2 -top-4 w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center shadow-[0px_10px_30px_rgba(16,111,75,0.35)] z-10"
        @click="$router.push({ name: 'App.FamilyTreeLayout' })"
      >
        <img src="@/assets/svg/home-footer-tree.svg" alt="growth icon" class="w-10 h-10" />
      </div>

      <div
        class="bg-white rounded-[28px] shadow-[0_-6px_20px_rgba(14,60,33,0.08)] flex items-center pt-6 pb-4"
      >
        <!-- Left items -->
        <div class="flex items-center flex-1 justify-around px-4">
          <button
            v-for="item in footerNavItems.slice(0, 2)"
            :key="item.id"
            :id="item.elId"
            class="flex flex-col items-center gap-1 text-xs font-medium transition-colors"
            @click="navigate(item.route)"
          >
            <MlbIcon
              :name="item.icon"
              :class="[
                'w-6 h-6',
                activeNav === item.id
                  ? 'text-primary-500 font-semibold active-icon'
                  : 'text-gray-400',
              ]"
            />
            <span :class="activeNav === item.id ? 'text-primary-500' : 'text-gray-400'">
              {{ item.label }}
            </span>
          </button>
        </div>

        <!-- Center spacer for tree button -->
        <div class="w-12 shrink-0"></div>

        <!-- Right items -->
        <div class="flex items-center flex-1 justify-around px-4">
          <button
            v-for="item in footerNavItems.slice(2)"
            :key="item.id"
            class="flex flex-col items-center gap-1 text-xs font-medium transition-colors"
            @click="navigate(item.route)"
          >
            <MlbIcon
              :name="item.icon"
              :class="[
                'w-6 h-6',
                activeNav === item.id
                  ? 'text-primary-500 font-semibold active-icon'
                  : 'text-gray-400',
              ]"
            />
            <span :class="activeNav === item.id ? 'text-primary-500' : 'text-gray-400'">
              {{ item.label }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import type { SidebarItem } from '@/types/layout.types'
import { useMediaQuery } from '@vueuse/core'

const $route = useRoute()
const $router = useRouter()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const footerNavItems: SidebarItem[] = [
  {
    id: 'home',
    elId: isLargeScreen.value ? '' : 'home-tour-step-1',
    label: '',
    icon: 'vuesax.broken.home-2',
    route: { name: 'App.HomeView' },
    main: true,
  },
  {
    id: 'heritage',
    label: '',
    icon: 'vuesax.outline.bank',
    route: { name: 'App.HeritageView' },
    main: true,
  },
  {
    id: 'storage',
    label: '',
    icon: 'vuesax.outline.folder-open',
    route: {
      name: 'App.HeritageVaultView',
      params: { module: 'storage' },
    },
    main: true,
  },
  {
    id: 'time-capsules',
    label: '',
    icon: 'time-capsule',
    route: { name: 'App.TimeCapsules.View' },
    main: true,
  },
]

const activeNav = computed(() => {
  const match = footerNavItems.find((item) => item.route.name === $route.name)
  return match?.id ?? footerNavItems[0]?.id ?? 'home'
})

const navigate = (route: SidebarItem['route']) => {
  if (!route) return
  $router.push(route)
}
</script>

<style scoped>
:deep(.active-icon svg),
:deep(.active-icon path),
:deep(.active-icon circle),
:deep(.active-icon rect),
:deep(.active-icon line) {
  stroke-width: 3;
  font-weight: 800;
}
</style>
