<template>
  <section class="md:px-16">
    <!-- <div class="md:hidden py-4">
      <BackButton icon="vuesax.linear.arrow-left" />
    </div> -->
    <div class="flex flex-col gap-6">
      <div class="border border-gray-200 rounded-3xl p-6 md:p-8">
        <h1 class="text-xl md:text-2xl font-semibold text-primary-500 mb-2">
          Welcome to the {{ heritageData?.community_name }} Cultural heritage.
        </h1>
        <p class="text-neutral-600 text-sm md:text-base leading-relaxed">
          The Cultural heritage helps you learn about your heritage, add new important information
          about the culture of your hometown and store information for future generations.
        </p>
      </div>

      <div class="bg-primary-50 border border-primary-200 rounded-3xl p-6 md:p-8 flex gap-4">
        <div class="mt-1">
          <MlbIcon name="lightbulb" />
        </div>
        <div>
          <p class="text-base md:text-lg font-semibold text-primary-500 mb-2">Did You Know?</p>
          <p class="text-neutral-700 text-sm md:text-base leading-relaxed bg-white p-4 rounded-xl">
            Yoruba culture has a rich tradition of oral history called “Oriki” – poetic praise names
            that chronicle family lineages and achievements.
          </p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-3xl p-6 md:p-8">
        <p class="text-sm font-semibold text-neutral-500 uppercase mb-1">About</p>
        <p class="text-neutral-700 text-sm md:text-base leading-relaxed">
          {{ heritageData?.about || 'No information available' }}
        </p>
      </div>

      <div class="p-1 md:p-2 mb-3">
        <n-collapse
          :accordion="false"
          class="heritage-collapse"
          :default-expanded-names="[]"
          arrow-placement="right"
        >
          <n-collapse-item
            v-for="section in sections"
            :key="section.key"
            :name="section.key"
            :class="['rounded-2xl']"
          >
            <template #header>
              <p class="text-neutral-900 font-medium">{{ section.title }}</p>
            </template>
            <div class="text-neutral-700 text-sm md:text-base leading-relaxed px-1 pb-2">
              {{ section.content || 'No information available' }}
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>

      <!-- <div
        class="border border-dashed border-primary-200 bg-primary-50 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center gap-4 mb-16"
      >
        <p class="text-neutral-700 text-sm md:text-base">
          Help build the cultural knowledge base for Badagry (Badagry)
        </p>
        <MlbButton
          label="+ Contribute Information"
          class="bg-white! text-primary-500! rounded-2xl! h-13!"
        />
      </div> -->
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import BackButton from '@/components/common/BackButton.vue'
// import MlbButton from '@/components/ui/MlbButton.vue'
import { NCollapse, NCollapseItem } from 'naive-ui'
import { useGetHeritageQuery } from '@/services/heritage.services'
import type { HeritageDataInterface } from '@/types/heritage.types'
import { handleApiError } from '@/helpers/error.helpers'
import { useMessage } from 'naive-ui'

const message = useMessage()
const heritageQuery = useGetHeritageQuery()

const heritageData = ref<HeritageDataInterface | null>(null)

const sections = computed(() => [
  {
    key: 'population',
    title: 'Population',
    content: heritageData?.value?.population,
  },
  {
    key: 'geography',
    title: 'Geography',
    content: heritageData?.value?.geographic_info,
  },
  {
    key: 'traditionalRulers',
    title: 'Traditional Rulers',
    content: heritageData?.value?.traditional_rulers,
  },
  {
    key: 'history',
    title: 'History',
    content: heritageData?.value?.history,
  },
  {
    key: 'economy',
    title: 'Economy',
    content: heritageData?.value?.economy,
  },
])

const fetchHeritage = async () => {
  try {
    const response = await heritageQuery.refetch()
    heritageData.value = response.data?.data as unknown as HeritageDataInterface
  } catch (error) {
    handleApiError(error, message)
  }
}

onMounted(async () => {
  await fetchHeritage()
})
</script>

<style scoped>
.heritage-collapse :deep(.n-collapse-item__content-inner) {
  padding: 0 18px 16px;
}
</style>
