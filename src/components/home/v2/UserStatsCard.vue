<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useProfileStore } from '@/stores/profile.store'
import type { SigninUser } from '@/types/authentication.types'

defineProps<{
  user: SigninUser | null
  familyMembersCount: number
  memoriesCount: number
}>()

defineEmits<{
  (e: 'add-members'): void
  (e: 'add-memories'): void
}>()

const profileStore = useProfileStore()
</script>

<template>
  <div class="bg-white rounded-2xl p-5 shadow-sm">
    <!-- Avatar + welcome -->
    <div class="flex items-center gap-3 mb-5">
      <img :src="profileStore.userAvatarUrl" :alt="user?.first_name || 'User'"
        class="w-12 h-12 rounded-full object-cover flex-shrink-0" />
      <div>
        <p class="text-xs text-neutral-700">Welcome back 👋</p>
        <p class="text-base font-semibold text-neutral-900">{{ user?.first_name }}</p>
      </div>
    </div>
    <hr class="border-neutral-100 my-5" />

    <!-- Stats -->
    <div class="space-y-2 mb-4">
      <div class="flex items-center justify-between bg-[#E8F6ED] rounded-xl px-3 py-2.5">
        <div class="flex items-center gap-2.5">
          <MlbIcon name="vuesax.linear.people" :size="18" class="text-neutral-400" />
          <span class="text-sm text-neutral-700">Family members added</span>
        </div>
        <span class="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md min-w-[20px] text-center">
          {{ familyMembersCount }}
        </span>
      </div>

      <div class="flex items-center justify-between bg-[#E8F6ED] rounded-xl px-3 py-2.5">
        <div class="flex items-center gap-2.5">
          <MlbIcon name="vuesax.linear.image" :size="18" class="text-neutral-400" />
          <span class="text-sm text-neutral-700">Memories shared</span>
        </div>
        <span class="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md min-w-[20px] text-center">
          {{ memoriesCount }}
        </span>
      </div>
    </div>

    <!-- Hint -->
    <p class="text-xs text-neutral-700 leading-relaxed mb-5">
      Add more relatives to your family tree to connect and keep your family together
    </p>

    <!-- CTAs -->
    <button
      class="w-full bg-primary-800 hover:bg-primary-900 text-white text-sm font-semibold py-3 rounded-3xl transition-colors mb-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      @click="$emit('add-members')">
      Add family members
    </button>
    <button class="w-full text-sm text-neutral-500 hover:text-neutral-800 py-1 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      @click="$emit('add-memories')">
      Add memories
    </button>
  </div>
</template>
