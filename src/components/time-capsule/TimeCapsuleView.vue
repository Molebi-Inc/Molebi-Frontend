<template>
  <div v-if="!loading" class="mx-20">
    <!-- <div
      v-if="capsule?.open_at && new Date(capsule.open_at) > new Date()"
      class="flex flex-col items-center mb-12"
    >
      <div class="flex justify-center items-center w-20 h-20 bg-[#FFFDEC] rounded-full mb-4">
        <MlbIcon name="placeholder" :size="34" color="#C2A100" />
      </div>
      <p class="text-gray-800 font-semibold">Time capsule is not yet available for preview</p>
    </div>
    <div v-else> -->
    <div>
      <div class="flex justify-center items-center mb-11">
        <h1 class="text-2xl font-bold text-gray-800 text-center">{{ capsule?.title }}</h1>
      </div>
      <div class="mb-4">
        <GalleryComponent
          :media="capsule?.attachments ?? []"
          :items-per-row="3"
          layout="horizontal"
          :item-size="102"
          :show-info="false"
        />
      </div>
      <div>
        <p class="text-gray-600 font-normal text-xs">{{ capsule?.description }}</p>
      </div>
    </div>
  </div>
  <div v-else>
    <PageLoader />
  </div>
</template>

<script setup lang="ts">
import type { TimeCapsuleInterface } from '@/types/time-capsule.types'
import GalleryComponent from '@/components/common/GalleryComponent.vue'
import { ref, onMounted } from 'vue'
import { useGetTimeCapsuleByIdQuery } from '@/services/time-capsule.services'
import { useRoute } from 'vue-router'
import PageLoader from '@/components/common/PageLoader.vue'

const $route = useRoute()

const capsule = ref<TimeCapsuleInterface | null>(null)
const loading = ref<boolean>(false)
const getTimeCapsuleDetails = useGetTimeCapsuleByIdQuery(Number($route.params.id))

const fetchTimeCapsuleDetails = async () => {
  loading.value = true
  const response = await getTimeCapsuleDetails.refetch()
  capsule.value = response.data?.data as TimeCapsuleInterface | null
  loading.value = false
}

onMounted(async () => {
  await fetchTimeCapsuleDetails()
})
</script>

<style scoped></style>
