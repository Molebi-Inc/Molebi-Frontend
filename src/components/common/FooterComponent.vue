<template>
  <nav class="md:hidden fixed left-1/2 bottom-4 z-30 w-[92%] -translate-x-1/2">
    <div class="relative">
      <div
        class="absolute left-1/2 -translate-x-1/2 -top-8 w-16 h-16 rounded-full bg-primary-800 flex items-center justify-center shadow-[0px_10px_30px_rgba(16,111,75,0.35)]"
      >
        <img src="@/assets/svg/home-footer-tree.svg" alt="growth icon" class="w-10 h-10" />
      </div>

      <div
        class="bg-white rounded-[28px] shadow-[0_-6px_20px_rgba(14,60,33,0.08)] flex items-center justify-between px-10 pt-6 pb-4"
      >
        <button
          v-for="item in footerNavItems"
          :key="item.id"
          class="flex flex-col items-center gap-1 text-xs font-medium transition-colors"
          @click="navigate(item.route)"
        >
          <MlbIcon
            :name="item.icon"
            :class="['w-6 h-6', activeNav === item.id ? 'text-primary-800' : 'text-gray-400']"
          />
          <span :class="activeNav === item.id ? 'text-primary-800' : 'text-gray-400'">
            {{ item.label }}
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import type { SidebarItem } from '@/types/layout.types'

const $route = useRoute()
const $router = useRouter()

const footerNavItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'vuesax.broken.home-2',
    route: { name: 'App.HomeView' },
    main: true,
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: 'vuesax.outline.folder-open',
    route: { name: 'App.StorageView' },
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
