<template>
  <div class="space-y-4 p-4">
    <div class="hidden md:block">
      <BackButton
        icon="vuesax.linear.arrow-left"
        class="mb-6"
        :previous-route="false"
        @update:go-back="$router.push({ name: 'App.HomeView' })"
      />
    </div>
    <!-- Family Statistics Section -->
    <div class="bg-white rounded-lg p-4 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <MlbIcon name="vuesax.linear.share" size="20" />
        <h3 class="text-base font-semibold text-gray-900">Family Statistics</h3>
      </div>

      <div class="space-y-4">
        <!-- Total Members -->
        <div>
          <p class="text-sm text-gray-600 mb-1">Total Members</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalMembers }}</p>
        </div>

        <!-- Gender Distribution -->
        <div>
          <p class="text-sm text-gray-600 mb-2">Gender Distribution</p>
          <div class="h-16">
            <GenderChart :men="menCount" :women="womenCount" />
          </div>
        </div>

        <!-- Living / Deceased -->
        <div>
          <p class="text-sm text-gray-600 mb-1">Living / Deceased</p>
          <p class="text-xl font-bold text-gray-900">{{ livingCount }}/{{ deceasedCount }}</p>
        </div>
      </div>
    </div>

    <!-- Family Info Section -->
    <div class="bg-white rounded-lg p-4 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <MlbIcon name="vuesax.linear.people" size="20" />
        <h3 class="text-base font-semibold text-gray-900">Family Info</h3>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-xs text-gray-500 mb-1">Family Name</p>
          <p class="text-sm font-medium text-gray-900">{{ familyName || 'N/A' }}</p>
        </div>

        <div>
          <p class="text-xs text-gray-500 mb-1">Community Name</p>
          <p class="text-sm font-medium text-gray-900">{{ communityName || 'N/A' }}</p>
        </div>

        <div>
          <p class="text-xs text-gray-500 mb-1">Family Tree Code</p>
          <p class="text-sm font-medium text-gray-900 font-mono">{{ familyTreeCode || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Family Meeting Section -->
    <div class="bg-white rounded-lg p-4 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <MlbIcon name="vuesax.linear.video-time" size="20" />
        <h3 class="text-base font-semibold text-gray-900">Family Meeting</h3>
      </div>

      <MlbButton
        block
        class="w-full border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg"
        @click="handleScheduleMeeting"
      >
        <template #icon>
          <MlbIcon name="vuesax.linear.calendar-add" size="18" class="mr-2" />
        </template>
        Schedule Meeting
      </MlbButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessage } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useGetFamilyTreesQuery, useGetFamilyMembersQuery } from '@/services/family-tree.service'
import type { FamilyTreeInterface } from '@/types/family-tree.types'
import GenderChart from '@/components/family-tree/GenderChart.vue'
import BackButton from '@/components/common/BackButton.vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'

const $router = useRouter()
const message = useMessage()
const profileStore = useProfileStore()

// Queries
const familyTreesQuery = useGetFamilyTreesQuery()
const familyMembersQuery = useGetFamilyMembersQuery()

// Computed values
const familyTreeData = computed<FamilyTreeInterface | null>(() => {
  return familyTreesQuery.data.value?.data || null
})

const familyTreeDetails = computed(() => {
  // Extract family tree details from the query if available
  // This might need to be adjusted based on actual API response structure
  return null
})

const allMembers = computed(() => {
  if (!familyTreeData.value) return []

  const { familyTree } = familyTreeData.value
  const members: any[] = []

  // Collect all members from different relationships
  if (familyTree.self) members.push(familyTree.self)
  if (familyTree.parents) members.push(...familyTree.parents)
  if (familyTree.siblings) members.push(...familyTree.siblings)
  if (familyTree.spouse) members.push(...familyTree.spouse)
  if (familyTree.children) members.push(...familyTree.children)
  if (familyTree.grandparents) members.push(...familyTree.grandparents)
  if (familyTree.grandchildren) members.push(...familyTree.grandchildren)
  if (familyTree.aunts_uncles) members.push(...familyTree.aunts_uncles)
  if (familyTree.nieces_nephews) members.push(...familyTree.nieces_nephews)
  if (familyTree.cousins) members.push(...familyTree.cousins)

  // Remove duplicates by id
  const uniqueMembers = members.filter(
    (member, index, self) => index === self.findIndex((m) => m.id === member.id),
  )

  return uniqueMembers
})

const totalMembers = computed(() => {
  return allMembers.value.length
})

const menCount = computed(
  () => allMembers.value.filter((member) => member.gender === 'male').length,
)

const womenCount = computed(() => totalMembers.value - menCount.value)

const livingCount = computed(() => {
  return totalMembers.value - deceasedCount.value
})

const deceasedCount = computed(() => {
  return allMembers.value.filter(
    (member) => member.relationship_metadata?.is_deceased || member.is_deceased,
  ).length
})

const familyName = computed(() => {
  if (familyTreeDetails.value) {
    return (familyTreeDetails.value as any).family_name
  }
  // Fallback: use family_name from first member if available
  const firstMember = allMembers.value[0]
  return firstMember?.family_name || 'N/A'
})

const communityName = computed(() => {
  return profileStore.userDetails?.community_name || 'N/A'
})

const familyTreeCode = computed(() => {
  return profileStore.userDetails?.family_tree?.unique_identifier || 'N/A'
})

const handleScheduleMeeting = () => {
  message.info('Schedule Meeting functionality coming soon')
  // TODO: Implement schedule meeting functionality
}
</script>

<style scoped></style>
