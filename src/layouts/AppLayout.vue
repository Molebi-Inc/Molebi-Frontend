<template>
  <div v-if="loading">
    <PageLoader />
  </div>
  <div v-else class="h-screen">
    <header class="px-[72px] pt-[40px]" v-if="$route.meta.hasLayoutLogo">
      <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
    </header>
    <div class="flex">
      <aside
        v-if="isLargeScreen && $route.meta.fullScreen !== 'web'"
        class="fixed left-0 top-0 h-full z-40"
      >
        <SidebarComponent />
      </aside>
      <main
        :class="[
          'flex-1 h-full relative pb-24 md:pb-0 overflow-y-auto',
          isLargeScreen && !['web', 'mobile'].includes($route.meta.fullScreen as string)
            ? 'md:ml-64'
            : '',
        ]"
      >
        <div :class="['h-full', isLargeScreen ? 'p-6' : '']">
          <header
            v-if="isLargeScreen && !['web', 'mobile'].includes($route.meta.fullScreen as string)"
          >
            <HeaderComponent />
          </header>
          <section
            :class="[
              'h-full',
              $route.meta.fullScreen === 'web' ? 'flex items-center justify-center' : '',
            ]"
          >
            <router-view />
          </section>
        </div>
        <FooterComponent v-if="!isLargeScreen && $route.meta.fullScreen !== 'mobile'" />
      </main>
    </div>
  </div>
  <img
    v-if="$route.meta.hasLayoutLeaf && isLargeScreen"
    src="@/assets/images/leaf.svg"
    alt="Molebi"
    class="absolute bottom-0 left-0 w-[347px] h-[454px]"
  />
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
import PageLoader from '@/components/common/PageLoader.vue'

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
