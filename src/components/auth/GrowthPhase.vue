<template>
  <div class="mt-[60px] mx-[100px]">
    <div
      class="border border-secondary-200 bg-brand-background grid grid-cols-2 gap-5 px-[32px] py-[16px] rounded-3xl"
    >
      <div class="">
        <img src="@/assets/svg/plant.svg" alt="Molebi" class="w-[388px] h-[417px]" />
      </div>
      <div class="flex flex-col justify-center">
        <h1 class="text-2xl font-semibold mb-2 text-black">
          Welcome to the <br />
          Growing phase
        </h1>
        <p class="text-black text-body-sm">
          Your tree is sprouting! Add more details and family <br />
          members to watch it grow strong and tall!
        </p>
        <div class="flex flex-col mt-12 mb-3.5">
          <MlbButton
            label="Continue"
            class="mb-4 rounded-2xl bg-green-700 py-4 px-7 text-white w-100"
            @click="
              $router.push({ name: 'Guests.OnboardingView', params: { module: 'family-info' } })
            "
          />
          <MlbButton
            label="Go to home screen"
            class="bg-green-50 text-green-900 py-4 px-7 font-medium w-100"
            @click="$router.push({ name: 'Guests.SigninView' })"
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
