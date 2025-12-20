<template>
  <div v-if="!loading" class="md:mx-20">
    <div
      v-if="capsule?.open_at && new Date(capsule.open_at) > new Date()"
      class="flex flex-col items-center mb-12"
    >
      <div class="flex justify-center items-center w-20 h-20 bg-[#FFFDEC] rounded-full mb-4">
        <MlbIcon name="placeholder" :size="34" color="#C2A100" />
      </div>
      <p class="text-gray-800 font-semibold">Time capsule is not yet available for preview</p>
    </div>
    <div v-else>
      <!-- <div> -->
      <div class="flex justify-start md:justify-center items-center mb-11 mt-8 md:mt-0">
        <h1 class="text-2xl font-bold text-gray-800 text-center">
          {{ capsule?.title }}
        </h1>
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
import { onMounted } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import PageLoader from '@/components/common/PageLoader.vue'
import GalleryComponent from '@/components/common/GalleryComponent.vue'
import { useTimeCapsule } from '@/composables/time-capsule.composables'

const { loading, fetchTimeCapsuleDetails, capsule } = useTimeCapsule()

onMounted(async () => {
  await fetchTimeCapsuleDetails()
})
</script>

<style scoped></style>
