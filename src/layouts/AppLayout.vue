<template>
  <div v-if="loading">
    <div class="flex justify-center items-center h-screen">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
      ></div>
    </div>
  </div>
  <div v-else class="grid grid-cols-full md:grid-cols-5 h-screen p-6">
    <aside v-if="isLargeScreen">
      <SidebarComponent />
    </aside>
    <main class="col-span-full md:col-span-4 h-full relative pb-24 md:pb-0">
      <header>
        <HeaderComponent />
      </header>
      <section class="h-full">
        <router-view />
      </section>
      <FooterComponent v-if="!isLargeScreen" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { RouterView } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { handleApiError } from '@/helpers/error.helpers'
import { useAuthenticationStore } from '@/stores/authentication.store'
import { useGetProfileMutation } from '@/services/authentication.services'
import HeaderComponent from '@/components/common/HeaderComponent.vue'
import SidebarComponent from '@/components/common/SidebarComponent.vue'
import FooterComponent from '@/components/common/FooterComponent.vue'

const message = useMessage()
const authenticationStore = useAuthenticationStore()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const getProfileMutation = useGetProfileMutation()

const loading = computed(() => getProfileMutation.isPending.value)

const getProfile = async () => {
  try {
    const response = await getProfileMutation.mutateAsync()
    authenticationStore.setStoreProp('loggedInUser', response.data)
  } catch (error) {
    handleApiError(error, message)
  }
}

onMounted(() => {
  if (authenticationStore.loggedInUser) {
    return
  }
  getProfile()
})
</script>
