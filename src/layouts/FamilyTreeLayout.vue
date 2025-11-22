<template>
  <div v-if="isResolvingFlow">
    <PageLoader />
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import PageLoader from '@/components/common/PageLoader.vue'
import { useGetFamilyMembersQuery } from '@/services/family-tree.service'
import { handleApiError } from '@/helpers/error.helpers'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const isResolvingFlow = ref(true)

const { refetch } = useGetFamilyMembersQuery({ enabled: false })

const resolveFamilyTreeFlow = async () => {
  //   isResolvingFlow.value = true

  try {
    const response = await refetch()
    const hasFamilyMembers = (response.data?.data?.length ?? 0) > 0
    const targetRoute = hasFamilyMembers ? 'App.FamilyTreeView' : 'App.FamilyTreeWelcomeView'

    await $router.replace({ name: targetRoute })
  } catch (error) {
    handleApiError(error, message)

    if ($route.name === 'App.FamilyTreeAppLayout') {
      await $router.replace({ name: 'App.FamilyTreeWelcomeView' })
    }
  } finally {
    isResolvingFlow.value = false
  }
}

watch(
  () => $route.name,
  () => {
    resolveFamilyTreeFlow()
  },
  { immediate: true },
)
</script>
