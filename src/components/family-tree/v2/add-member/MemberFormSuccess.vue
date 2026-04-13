<template>
  <div class="flex flex-col items-center px-6 py-8">
    <!-- Avatar with check badge -->
    <div class="relative mb-6">
      <div class="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="memberName"
          class="w-full h-full object-cover"
        />
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-12 h-12 text-neutral-300"
        >
          <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
        </svg>
      </div>
      <!-- Green check badge -->
      <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-4 h-4">
          <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Title & message -->
    <h2 class="text-xl font-bold text-neutral-900 mb-2 underline">Great job!</h2>
    <p class="text-sm text-neutral-600 text-center mb-8 leading-relaxed">
      <strong>{{ memberName }}</strong> was successfully added to your tree
    </p>

    <!-- Action buttons -->
    <div class="w-full space-y-3">
      <button
        class="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm py-4 rounded-2xl transition-colors"
        @click="$emit('add-another')"
      >
        Add another relative
      </button>

      <button
        class="w-full border border-primary-300 text-primary-700 font-semibold text-sm py-4 rounded-2xl transition-colors hover:bg-primary-50"
        @click="$emit('view-profile')"
      >
        View {{ pronounLabel }} profile
      </button>

      <button
        class="w-full border border-primary-300 text-primary-700 font-semibold text-sm py-4 rounded-2xl transition-colors hover:bg-primary-50"
        @click="$emit('view-tree')"
      >
        View Tree
      </button>

      <button
        class="w-full border border-primary-300 text-primary-700 font-semibold text-sm py-4 rounded-2xl transition-colors hover:bg-primary-50 flex items-center justify-center gap-2"
        :disabled="isInviting"
        @click="$emit('invite')"
      >
        <svg v-if="isInviting" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-4 h-4 animate-spin">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
        </svg>
        Invite via Whatsapp
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  memberName: string
  memberGender: string
  avatarUrl?: string | null
  isInviting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: null,
  isInviting: false,
})

defineEmits<{
  (e: 'add-another'): void
  (e: 'view-profile'): void
  (e: 'view-tree'): void
  (e: 'invite'): void
}>()

const pronounLabel = computed(() => {
  if (props.memberGender === 'male') return 'his'
  if (props.memberGender === 'female') return 'her'
  return 'their'
})
</script>
