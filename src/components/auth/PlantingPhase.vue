<template>
  <div class="grid grid-cols-7 gap-4 bg-brand-background">
    <div class="border-r border-primary-300 bg-white col-span-4 px-[72px] py-[40px]">
      <header>
        <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
      </header>
      <img src="@/assets/svg/nut.svg" alt="Molebi" class="w-[540px] h-[540px]" />
    </div>
    <div class="flex flex-col items-center justify-center col-span-3 px-[120px]">
      <h1 class="text-2xl font-semibold mb-2 text-black">Welcome to the Seed Planting Phase</h1>
      <p class="text-black text-body-sm">
        Welcome to the seed planting phase, start your family tree and branch procedure today by
        planting the first see of your own family tree which is you
      </p>
      <div class="flex flex-col mt-12 mb-3.5">
        <MlbButton
          label="Continue"
          class="mb-4 rounded-2xl bg-green-700 py-4 px-7 text-white w-100"
          @click="
            $router.push({ name: 'Guests.OnboardingView', params: { module: 'personal-info' } })
          "
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'

const $router = useRouter()
</script>
