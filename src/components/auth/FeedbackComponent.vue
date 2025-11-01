<template>
  <div>
    <div class="flex flex-col justify-center items-center mb-4">
      <img src="@/assets/images/success.png" alt="Success" class="mb-2 md:mb-4 h-18 md:h-auto" />
      <h1 class="text-neutral-900 font-semibold text-2xl mb-1 md:mb-2 text-center">
        Your successfully changed your password
      </h1>
      <p class="text-neutral-600 font-normal text-sm text-center">
        We know that many things may happen but we hope that you always remember your new password
      </p>
    </div>
    <div>
      <MlbButton
        type="primary"
        label="Go to login"
        block
        class="rounded-2xl! bg-primary-700! h-13!"
        @click="$router.push({ name: 'Guests.SigninView' })"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'
const $router = useRouter()
</script>
