<template>
  <div class="flex flex-col items-center justify-center py-8 px-6 text-center">
    <MlbIcon
      name="vuesax.linear.info-circle"
      :color="'#EC1919'"
      :size="64"
      class="mb-4"
    />
    <h2 class="text-2xl font-semibold mb-2 text-gray-900">
      Link Has Expired
    </h2>
    <p class="text-gray-700 mb-6 max-w-md">
      This invitation link has expired. Please contact the person who invited you to resend a new invitation link.
    </p>
    <MlbButton
      label="Go to Login"
      class="rounded-2xl! bg-primary-700! h-13! text-white! w-full max-w-xs"
      @click="$router.push({ name: 'Guests.SigninView' })"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'

const $router = useRouter()
</script>