<template>
  <section class="px-16">
    <div class="flex flex-col gap-6">
      <div class="border border-gray-200 rounded-3xl p-6 md:p-8">
        <h1 class="text-xl md:text-2xl font-semibold text-primary-500 mb-2">
          Welcome to the Cultural heritage.
        </h1>
        <p class="text-neutral-600 text-sm md:text-base leading-relaxed">
          The Cultural heritage helps you learn about your heritage, add new important information about
          the culture of your hometown and store information for future generations.
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
          Badagry is a town in Badagry, Akwa Ibom State, Nigeria. Rich in cultural heritage and
          traditions.
        </p>
      </div>

      <div class="p-1 md:p-2">
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
              {{ section.content }}
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>

      <div
        class="border border-dashed border-primary-200 bg-primary-50 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center gap-4 mb-16"
      >
        <p class="text-neutral-700 text-sm md:text-base">
          Help build the cultural knowledge base for Badagry (Badagry)
        </p>
        <MlbButton
          label="+ Contribute Information"
          class="bg-white! text-primary-500! rounded-2xl! h-13!"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { NCollapse, NCollapseItem } from 'naive-ui'

const sections = computed(() => [
  {
    key: 'population',
    title: 'Population',
    content:
      'Badagry has historically been a vibrant trading hub, drawing diverse communities and visitors along its coastal routes.',
  },
  {
    key: 'geography',
    title: 'Geography',
    content:
      'Situated along the Atlantic coast, Badagry features lagoons, sandy beaches, and lush greenery that have shaped its fishing and trading traditions.',
  },
  {
    key: 'traditionalRulers',
    title: 'Traditional Rulers',
    content:
      'The town is guided by traditional institutions that preserve customs, mediate communal matters, and steward cultural events.',
  },
  {
    key: 'history',
    title: 'History',
    content:
      'Badagry played a significant role in West African trade routes and remains a symbol of resilience, memory, and cultural continuity.',
  },
  {
    key: 'economy',
    title: 'Economy',
    content:
      'Commerce, fishing, and tourism anchor the local economy, with cultural heritage sites attracting visitors from within and outside Nigeria.',
  },
])
</script>

<style scoped>
/* .heritage-collapse :deep(.n-collapse-item__header) {
  padding: 16px 18px;
  border-bottom: 1px solid #e5e7eb;
} */

.heritage-collapse :deep(.n-collapse-item__content-inner) {
  padding: 0 18px 16px;
}
</style>
