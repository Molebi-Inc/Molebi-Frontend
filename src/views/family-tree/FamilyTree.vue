<template>
  <div class="min-h-screen bg-white lg:bg-brand-background overflow-hidden">
    <!-- Mobile Header -->
    <div
      class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white px-4 py-3 border-b border-gray-100 flex items-center"
    >
      <BackButton icon="vuesax.linear.arrow-left" />
      <span class="ml-4 font-semibold text-lg text-gray-900" v-if="!hasFamily">Family Tree</span>
    </div>

    <div class="flex flex-col lg:grid lg:grid-cols-12 h-screen pt-[60px] lg:pt-0">
      <!-- Left Side: Hero / Decorative (Desktop Only) -->
      <div
        class="hidden lg:flex lg:col-span-5 xl:col-span-4 bg-primary-50 relative overflow-hidden flex-col justify-between p-12"
      >
        <div class="z-10">
          <div
            class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-primary-600/20"
          >
            <MlbIcon name="vuesax.bold.tree" class="text-white" :size="24" />
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Discover your<br />family roots
          </h1>
          <p class="text-lg text-gray-600 max-w-sm">
            Connect with your heritage, build your family tree, and preserve memories for
            generations.
          </p>
        </div>

        <!-- Decorative Background Elements -->
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-50 pointer-events-none"
        >
          <img
            src="@/assets/svg/seed.svg"
            alt="Molebi Tree"
            class="w-full h-full object-contain opacity-20"
          />
        </div>

        <div class="z-10 text-sm text-gray-500">
          © {{ new Date().getFullYear() }} Molebi. All rights reserved.
        </div>
      </div>

      <!-- Right Side: Content Area -->
      <div
        class="flex-1 lg:col-span-7 xl:col-span-8 bg-white h-full overflow-y-auto relative flex flex-col"
      >
        <!-- Desktop Header -->
        <div class="hidden lg:flex items-center justify-between px-12 py-8">
          <BackButton v-if="!hasFamily" icon="vuesax.linear.arrow-left" />
          <div v-else></div>
          <!-- Spacer -->

          <!-- Optional: User Profile or Actions could go here -->
        </div>

        <!-- Main Content Container -->
        <div class="flex-1 flex flex-col px-4 lg:px-12 xl:px-24 pb-12">
          <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform translate-y-4 opacity-0"
            mode="out-in"
          >
            <div v-if="!hasFamily" class="w-full max-w-xl mx-auto my-auto">
              <AddOrJoinFamilyForm @add-member="handleAddMember" @join-tree="handleJoinTree" />
            </div>
            <div v-else class="w-full h-full">
              <FamilyTreeView />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BackButton from '@/components/common/BackButton.vue'
import AddOrJoinFamilyForm from '@/components/family-tree/AddOrJoinFamilyForm.vue'
import FamilyTreeView from '@/components/family-tree/FamilyTreeView.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'

// State to track if user has a family tree
// In a real app, this would come from a store or API
const hasFamily = ref(false)

interface AddMemberFormData {
  relationship: string
  first_name: string
  middle_name: string
  nick_name: string
  family_name: string
  same_family: boolean
}

interface JoinTreeFormData {
  tree_url: string
  family_member: string
  relationship: string
}

const handleAddMember = (data: AddMemberFormData) => {
  console.log('Add Member Form:', data)
  // Mock success transition
  hasFamily.value = true
}

const handleJoinTree = (data: JoinTreeFormData) => {
  console.log('Join Tree Form:', data)
  // Mock success transition
  hasFamily.value = true
}
</script>
