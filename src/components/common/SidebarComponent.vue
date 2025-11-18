<template>
  <section
    :class="[
      'w-64 bg-white border-r border-gray-200 transition-all duration-300 relative h-full py-12',
      sidebarCollapsed && '-ml-64',
    ]"
  >
    <header class="h-12 flex items-center justify-center mb-6">
      <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
    </header>
    <nav class="p-4 space-y-2">
      <router-link
        v-for="item in sidebarItems.filter((item) => item.main)"
        :key="item.id"
        :to="item.route"
        :id="item.elId"
      >
        <div
          :class="[
            'px-4 py-3 rounded-lg cursor-pointer transition-colors',
            activeNav === item.id
              ? 'bg-primary-50 text-primary-800 font-medium rounded-full'
              : 'text-gray-600 hover:bg-gray-50',
          ]"
        >
          <div class="flex items-center gap-3">
            <MlbIcon :name="item.icon" class="w-6 h-6 fill-primary-500!" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </router-link>
      <hr class="my-4 border-gray-200" />
      <router-link
        v-for="item in sidebarItems.filter((item) => !item.main)"
        :key="item.id"
        :to="item.route"
      >
        <div
          :class="[
            'px-4 py-3 rounded-lg cursor-pointer transition-colors',
            activeNav === item.id
              ? 'bg-primary-50 text-primary-800 font-medium rounded-full'
              : 'text-gray-600 hover:bg-gray-50',
          ]"
        >
          <div class="flex items-center gap-3">
            <MlbIcon :name="item.icon" class="w-6 h-6 fill-primary-500!" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </router-link>
      <!-- </div> -->
    </nav>

    <div class="absolute bottom-6 left-6 right-6">
      <div>
        <img src="@/assets/svg/tree-2.svg" alt="tree" class="w-50 h-60" />
      </div>
      <hr class="mb-4 border-gray-200" />
      <div class="px-4 py-3 rounded-lg cursor-pointer transition-colors">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8">
            <img
              :src="
                loggedInUser?.avatar ||
                loggedInUser?.profile_picture ||
                'https://ui-avatars.com/api/?name=' +
                  loggedInUser?.first_name +
                  ' ' +
                  loggedInUser?.family_name +
                  '&background=random&size=48'
              "
              alt="profile"
              class="w-full h-full rounded-full"
            />
          </div>
          <div class="text-sm">
            <p class="text-gray-600 text-xs">Welcome back 👋</p>
            <p class="font-medium text-gray-900">{{ loggedInUser?.first_name }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'
import type { SidebarItem } from '@/types/layout.types'
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authentication.store'

const $route = useRoute()
const authenticationStore = useAuthenticationStore()

const activeNav = ref('home')
const sidebarCollapsed = ref(false)
const sidebarItems: SidebarItem[] = [
  {
    id: 'home',
    elId: 'home-tour-step-1',
    label: 'Home',
    icon: 'vuesax.broken.home-2',
    route: { name: 'App.HomeView' },
    main: true,
  },
  {
    id: 'family-tree',
    label: 'Family Tree',
    icon: 'family-tree',
    route: { name: 'App.FamilyTreeView' },
    main: true,
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: 'vuesax.outline.folder-open',
    route: { name: 'App.StorageView' },
    main: true,
  },
  {
    id: 'time-capsules',
    label: 'Time capsules',
    icon: 'time-capsule',
    route: { name: 'App.TimeCapsules.View' },
    main: true,
  },
  {
    id: 'vault',
    label: 'Vault',
    icon: 'vault',
    route: { name: 'App.VaultView' },
    main: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'gear',
    route: { name: 'App.SettingsView' },
    main: false,
  },
]

const loggedInUser = computed(() => authenticationStore.loggedInUser)

watch(
  () => $route.name,
  (newVal) => {
    if (newVal) {
      const item = sidebarItems.find((item) => item.route.name === newVal)
      activeNav.value = item?.id || 'home'
    }
  },
  { immediate: true },
)
</script>
