<template>
  <div class="grid grid-cols-1 md:grid-cols-7 h-screen bg-brand-background overflow-hidden">
    <div
      class="border-r border-primary-300 bg-white col-span-full md:col-span-4 px-4 md:px-[72px] py-4 md:py-[40px] flex flex-col overflow-hidden"
    >
      <header class="shrink-0 mb-2 md:mb-0">
        <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[140px] md:w-[172px] h-auto" />
      </header>
      <div class="flex-1 flex items-center justify-center min-h-0">
        <img
          src="@/assets/svg/seed.svg"
          alt="Molebi"
          class="w-full h-full max-w-[280px] max-h-[280px] md:max-w-[540px] md:max-h-[540px] object-contain"
        />
      </div>
    </div>
    <div
      class="flex flex-col items-center justify-center col-span-full md:col-span-3 px-4 md:px-[120px] py-4 md:py-0 overflow-hidden"
    >
      <h1 class="text-xl md:text-2xl font-semibold mb-2 text-black text-center shrink-0">
        Welcome to the Seed Planting Phase
      </h1>
      <p class="text-black text-body-sm text-center shrink-0 mb-4 md:mb-0">
        Welcome to the seed-planting phase. Start your family tree and branching journey today by
        planting the first seed of your own tree - yourself.
      </p>
      <div class="flex flex-col mt-6 md:mt-12 mb-2 md:mb-3.5 w-full shrink-0">
        <MlbButton
          label="Continue"
          class="rounded-2xl! bg-green-700! h-12! md:h-13! text-white! w-full!"
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
