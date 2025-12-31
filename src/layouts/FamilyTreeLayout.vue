<template>
  <div v-if="isResolvingFlow">
    <PageLoader />
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { handleApiError } from '@/helpers/error.helpers'
import PageLoader from '@/components/common/PageLoader.vue'
import { useFamilyTree } from '@/composables/family-tree.composables'
import { useGetFamilyMembersQuery } from '@/services/family-tree.service'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const isResolvingFlow = ref(true)

const { refetch } = useGetFamilyMembersQuery({ enabled: false })
const { fetchFamilyTrees } = useFamilyTree()

const resolveFamilyTreeFlow = async () => {
  //   isResolvingFlow.value = true

  try {
    const response = await refetch()
    const hasFamilyMembers = (response.data?.data?.length ?? 0) > 0

    if (!hasFamilyMembers) {
      await $router.replace({
        name: 'App.FamilyTreeOnboardingView',
        params: { module: 'add-member' },
      })
      return
    }

    await $router.replace({ name: 'App.FamilyTreeView' })
  } catch (error) {
    handleApiError(error, message)

    if ($route.name === 'App.FamilyTreeAppLayout') {
      await $router.replace({
        name: 'App.FamilyTreeOnboardingView',
        params: { module: 'add-member' },
      })
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

onMounted(async () => {
  await fetchFamilyTrees()
})
</script>
