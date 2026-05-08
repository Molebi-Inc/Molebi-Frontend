<template>
  <div class="bg-white rounded-3xl px-8 py-10 flex flex-col gap-8 invitation-card">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-neutral-900 font-bold text-2xl mb-3">Welcome to Molebi!</h1>
      <p class="text-neutral-500 text-sm leading-relaxed">
        You have been invited to join the
        <strong class="text-neutral-900 font-bold">{{ familySpaceName }}</strong>
        by
        <strong class="text-neutral-900 font-bold">{{ inviterName }}</strong>
        your {{ relationship }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-3">
      <button
        class="w-full py-4 rounded-full bg-primary-700 text-white font-semibold text-base transition-colors hover:bg-primary-800 active:bg-primary-900 cursor-pointer"
        :disabled="loading"
        @click="$emit('accept')"
      >
        <span v-if="loading && accepting">Accepting...</span>
        <span v-else>Accept Invitation</span>
      </button>

      <button
        class="w-full py-4 rounded-full border border-primary-700 text-primary-700 font-semibold text-base bg-white transition-colors hover:bg-primary-50 active:bg-primary-100 cursor-pointer"
        :disabled="loading"
        @click="$emit('decline')"
      >
        <span v-if="loading && !accepting">Declining...</span>
        <span v-else>Decline Invitation</span>
      </button>
    </div>

    <!-- Privacy notice -->
    <div class="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-2xl px-4 py-4">
      <svg
        class="shrink-0 mt-0.5 text-primary-700"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
      <p class="text-primary-700 text-sm leading-relaxed">
        <strong class="font-bold">Your information is private</strong>
        and only visible to family members invited to join.
      </p>
    </div>

    <!-- Footer -->
    <p class="text-center text-neutral-500 text-sm">
      Already have an account?
      <RouterLink
        :to="{ name: 'Guests.SigninView' }"
        class="text-neutral-900 font-semibold underline underline-offset-2"
      >
        Log in
      </RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  familySpaceName: string
  inviterName: string
  relationship: string
  loading?: boolean
  accepting?: boolean
}>()

defineEmits<{
  accept: []
  decline: []
}>()
</script>

<style scoped>
.invitation-card {
  box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.08);
}
</style>
