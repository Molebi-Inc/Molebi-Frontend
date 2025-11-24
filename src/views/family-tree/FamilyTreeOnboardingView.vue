<template>
  <section class="w-full">
    <div :class="['w-full', { 'md:flex justify-center items-center': !component?.has_full_page }]">
      <div
        :class="[
          {
            'px-4 py-8 md:p-12 md:w-[522px] h-full md:rounded-3xl md:border border-secondary-200 md:bg-white':
              !component?.has_full_page,
            'w-full': component?.has_full_page,
          },
        ]"
      >
        <BackButton
          v-if="component?.has_back_button"
          icon="vuesax.linear.arrow-left"
          class="mb-6"
        />
        <div
          :class="[
            'flex flex-col gap-[45px] h-full',
            { 'w-full': component?.has_full_page, 'md:px-4': !component?.has_full_page },
          ]"
        >
          <div v-if="!component?.has_full_page">
            <h1 class="text-neutral-900 font-semibold text-2xl mb-2 text-center">
              {{ component?.title }}
            </h1>
            <p class="text-neutral-600 font-normal text-sm text-center">
              {{ component?.description }}
            </p>
          </div>
          <component :is="component?.component" :key="String($route.params.module ?? '')" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from '@/components/common/BackButton.vue'
import BranchPhase from '@/components/family-tree/BranchPhase.vue'
import FlourishPhase from '@/components/family-tree/FlourishPhase.vue'
import FamilyMemberForm from '@/components/family-tree/FamilyMemberForm.vue'

const $route = useRoute()

const component = computed(() => {
  switch (true) {
    case $route.params.module === 'add-member':
      return {
        component: FamilyMemberForm,
        title: 'Add Family Member',
        description: 'Add a family member',
        has_back_button: true,
      }
    case $route.params.module === 'join-family':
      return {
        component: FamilyMemberForm,
        title: 'Join Existing Tree',
        description: 'Enter your personal Information',
        has_back_button: true,
        has_full_page: false,
      }
    case $route.name === 'App.FamilyTreeWelcomeView':
      return {
        component: BranchPhase,
        has_full_page: true,
      }
    case $route.params.module === 'complete':
      return {
        component: FlourishPhase,
        has_full_page: true,
      }
    default:
      return null
  }
})
</script>
