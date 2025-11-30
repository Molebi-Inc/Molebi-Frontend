<template>
  <div v-if="loading">
    <PageLoader />
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import PageLoader from '@/components/common/PageLoader.vue'

const $route = useRoute()
const $router = useRouter()
const profileStore = useProfileStore()

const loading = ref<boolean>(true)
const hasFamilyInfo = computed(() => {
  const profile = profileStore.userDetails
  return (
    !!profile &&
    // profile?.state_id &&
    !!profile?.mother_family_name &&
    !!profile?.num_of_children &&
    !!profile?.community_name
  )
})

const onboardingRoutes = ['App.StorageWelcomeView', 'App.StorageFamilyInfoView'] as const

const resolveStorageFlow = async () => {
  loading.value = true

  const currentName = $route.name
  const canAccessOnboarding = onboardingRoutes.includes(
    currentName as (typeof onboardingRoutes)[number],
  )

  if (hasFamilyInfo.value) {
    // if (currentName !== 'App.StorageFolderView') {
    const params = { ...$route.params }
    const query = { ...$route.query }
    await $router.replace({ name: 'App.StorageFolderView', params, query })
    // }
  } else if (!canAccessOnboarding) {
    await $router.replace({ name: 'App.StorageWelcomeView' })
  }

  loading.value = false
}

watch(
  [() => $route.name, hasFamilyInfo],
  () => {
    resolveStorageFlow()
  },
  { immediate: true },
)
</script>
