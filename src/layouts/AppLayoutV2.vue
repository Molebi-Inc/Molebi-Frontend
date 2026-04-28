<template>
  <div v-if="userProfileLoading">
    <PageLoader />
  </div>
  <div v-else class="min-h-screen flex flex-col relative overflow-x-hidden bg-primary-50 md:bg-brand-green">
    <!-- Soft yellow gradient wash behind nav + left card (top-left third only) -->
    <div v-if="$route.name === 'App.HomeView'"
      class="pointer-events-none absolute inset-x-0 top-0 h-[420px] md:h-[520px] hidden md:block" style="
        background:
          radial-gradient(720px 420px at 12% 18%, rgba(255, 213, 128, 0.58), rgba(255, 213, 128, 0) 52%),
          linear-gradient(to bottom, rgba(255, 245, 225, 0.55), rgba(255, 245, 225, 0) 70%);
      " />

    <!-- <div class="relative z-10 flex flex-col min-h-screen"> -->
    <div class="relative z-10 flex flex-col h-screen">
      <!-- Desktop navigation -->
      <HomeTopBar class="hidden md:flex" />
      <HomeNavbar class="hidden md:flex" />

      <!-- Mobile navigation -->
      <HomeMobileHeader class="md:hidden" @open-menu="drawerOpen = true" />
      <HomeMobileDrawer v-model:show="drawerOpen" />

      <!-- Page content -->
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile.store'
import { useProfile } from '@/composables/useProfile'
import { useHome } from '@/composables/useHome'
import PageLoader from '@/components/common/PageLoader.vue'
import HomeTopBar from '@/components/home/v2/HomeTopBar.vue'
import HomeNavbar from '@/components/home/v2/HomeNavbar.vue'
import HomeMobileHeader from '@/components/home/v2/HomeMobileHeader.vue'
import HomeMobileDrawer from '@/components/home/v2/HomeMobileDrawer.vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
const { fetchTourStages } = useHome()
const profileStore = useProfileStore()
const { userProfileLoading, getProfile } = useProfile()

const drawerOpen = ref(false)

onMounted(async () => {
  await fetchTourStages()
  if (!profileStore.user) {
    await getProfile()
  }
})
</script>
