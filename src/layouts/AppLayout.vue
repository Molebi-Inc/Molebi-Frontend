<template>
  <div v-if="loading">
    <div class="flex justify-center items-center h-screen">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
      ></div>
    </div>
  </div>
  <div v-else class="flex h-screen">
    <aside v-if="isLargeScreen" class="fixed left-0 top-0 h-full z-40">
      <SidebarComponent />
    </aside>
    <main
      :class="[
        'flex-1 h-full relative pb-24 md:pb-0 overflow-y-auto',
        isLargeScreen ? 'md:ml-64' : '',
      ]"
    >
      <div :class="['h-full', isLargeScreen ? 'p-6' : '']">
        <header v-if="isLargeScreen || $route.meta.fullScreen !== 'mobile'">
          <HeaderComponent />
        </header>
        <section class="h-full">
          <router-view />
        </section>
      </div>
      <FooterComponent v-if="!isLargeScreen && $route.meta.fullScreen !== 'mobile'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { onMounted, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { handleApiError } from '@/helpers/error.helpers'
import { useProfileStore } from '@/stores/profile.store'
import HeaderComponent from '@/components/common/HeaderComponent.vue'
import FooterComponent from '@/components/common/FooterComponent.vue'
import SidebarComponent from '@/components/common/SidebarComponent.vue'
import { useGetProfileQuery } from '@/services/authentication.services'
import { useRoute } from 'vue-router'

const $route = useRoute()
const message = useMessage()
const profileStore = useProfileStore()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const { data, isPending, refetch } = useGetProfileQuery({
  enabled: false,
})

const loading = computed(() => isPending.value)

const getProfile = async () => {
  try {
    const response = await refetch()
    profileStore.setStoreProp('user', response.data?.data)
  } catch (error) {
    handleApiError(error, message)
  }
}

onMounted(() => {
  if (profileStore.user) {
    return
  }
  getProfile()
})
</script>
