<template>
  <div class="mt-[60px] mx-[100px]">
    <div
      class="border border-secondary-200 bg-brand-background grid grid-cols-2 gap-5 px-[32px] py-[64px] rounded-3xl"
    >
      <div class="">
        <img src="@/assets/svg/branch.svg" alt="Molebi" class="w-[385px] h-[288px]" />
      </div>
      <div class="flex flex-col justify-center">
        <h1 class="text-2xl font-semibold mb-2 text-black">
          Now you are ready to <br />
          grow your first branch
        </h1>
        <p class="text-black text-body-sm">
          Your tree is thriving! Add relatives and build your <br />family's legacy, one branch at a
          time.
        </p>
        <div class="flex flex-col mt-12 mb-3.5 gap-4">
          <MlbButton
            label="Continue"
            class="rounded-2xl! bg-green-700! py-4! px-7! text-white! w-100! h-13!"
            @click="
              $router.push({
                name: 'App.FamilyTreeOnboardingView',
                params: { module: 'add-member' },
              })
            "
          />
          <MlbButton
            label="Go to home screen"
            class="bg-green-50! text-green-900! py-4! px-7! font-medium! w-100! h-13! rounded-2xl!"
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
