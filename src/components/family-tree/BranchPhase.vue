<template>
  <div
    class="h-screen bg-brand-background overflow-hidden flex items-center justify-center px-4 md:px-[100px] py-4 md:py-[60px]"
  >
    <div
      class="border border-secondary-200 bg-brand-background grid grid-cols-1 md:grid-cols-2 px-[32px] py-8 md:py-[64px] rounded-3xl h-full w-full max-h-full overflow-hidden"
    >
      <div class="flex items-center justify-center min-h-0">
        <img
          src="@/assets/svg/branch.svg"
          alt="Molebi"
          class="w-full h-full max-w-[385px] max-h-[288px] object-contain"
        />
      </div>
      <div class="flex flex-col justify-center overflow-hidden py-4 md:py-0">
        <h1 class="text-2xl font-semibold mb-2 text-black shrink-0">
          Now you are ready to <br />
          grow your first branch
        </h1>
        <p class="text-black text-body-sm mb-4 md:mb-0 shrink-0">
          Your tree is thriving! Add relatives and build your <br class="hidden md:block" />family's
          legacy, one branch at a time.
        </p>
        <div class="flex flex-col mt-4 md:mt-12 mb-2 md:mb-3.5 gap-3 md:gap-4 shrink-0">
          <MlbButton
            label="Continue"
            class="rounded-2xl! bg-green-700! py-4! px-7! text-white! w-full! h-13!"
            @click="
              $router.push({
                name: 'App.FamilyTreeOnboardingView',
                params: { module: 'add-member' },
              })
            "
          />
          <MlbButton
            label="Go to home screen"
            class="bg-green-50! text-green-900! py-4! px-7! font-medium! w-full! h-13! rounded-2xl!"
            @click="$router.push({ name: 'App.HomeView' })"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'

const $router = useRouter()
</script>
