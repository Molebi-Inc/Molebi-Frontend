<template>
  <div class="flex flex-col">
    <div class="px-5 py-4 border-b border-neutral-100">
      <h2 class="text-lg font-semibold text-neutral-900 text-center">Add Family Member</h2>
      <p class="text-sm text-neutral-500 text-center mt-1">
        Select which family member to add to {{ userFirstName }}:
      </p>
    </div>

    <div class="flex-1 overflow-y-auto py-3 px-4 space-y-2">
      <button v-for="type in MEMBER_TYPES" :key="type.key"
        class="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl border transition-colors text-left"
        :class="isDisabled(type)
            ? 'border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed'
            : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer'
          " :disabled="isDisabled(type)" @click="!isDisabled(type) && $emit('select', type)">
        <span class="text-sm font-medium" :class="isDisabled(type) ? 'text-neutral-400' : 'text-neutral-800'">
          {{ type.label }}
        </span>
        <span v-if="!isDisabled(type)" class="text-sm font-semibold text-primary-700">
          Add
        </span>
        <span v-else class="text-xs text-neutral-400">Added</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import { useProfileStore } from '@/stores/profile.store'
import { MEMBER_TYPES } from './member-type.config'
import type { MemberTypeConfig } from './member-type.config'

defineEmits<{
  (e: 'select', type: MemberTypeConfig): void
}>()

const familyTreeStore = useFamilyTreeStore()
const profileStore = useProfileStore()

const userFirstName = computed(
  // () => profileStore.userDetails?.first_name || profileStore.userDetails?.full_name || 'you',
  () => profileStore.userDetails?.first_name || 'you',
)

const isDisabled = (type: MemberTypeConfig): boolean => {
  if (!type.singleOnly) return false
  if (!type.occupiedByRelationTypes.length) return false

  const tree = familyTreeStore.familyTreeData?.familyTree
  if (!tree) return false

  const group = tree[type.existingTreeKey]
  if (!Array.isArray(group)) return false

  return group.some((member) => {
    const rt = member.relationship_metadata?.relation_type
    return rt && type.occupiedByRelationTypes.includes(rt)
  })
}
</script>
