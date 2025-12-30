<template>
  <section class="h-full">
    <div class="w-full">
      <div
        :class="['w-full', { 'md:flex justify-center items-center': !component?.has_full_page }]"
      >
        <div
          :class="[
            {
              'md:border border-secondary-200 md:bg-white ': ['App.StorageFamilyInfoView'].includes(
                $route.name as string,
              ),
            },
            {
              'px-4 py-8 md:p-12 md:w-[522px] h-full md:rounded-3xl': !component?.has_full_page,
              'w-full': component?.has_full_page,
            },
          ]"
        >
          <div class="mb-6">
            <BackButton v-if="component?.has_back_button" icon="vuesax.linear.arrow-left" />
          </div>
          <div
            :class="[
              'flex flex-col gap-[45px] h-full',
              { 'w-full': component?.has_full_page, 'md:px-4': !component?.has_full_page },
            ]"
          >
            <component :is="component?.component" :key="String($route.params.module ?? '')" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from '@/components/common/BackButton.vue'
import GrowingPhase from '@/components/storage/GrowingPhase.vue'

const $route = useRoute()

const component = computed(() => {
  return {
    'App.StorageWelcomeView': {
      has_back_button: false,
      has_full_page: true,
      component: GrowingPhase,
    },
  }[$route.name as string]
})
</script>

<style scoped>
:deep(.n-form-item-label) {
  font-weight: 500;
  color: #374151;
}
</style>
