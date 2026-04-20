<template>
  <div class="flex flex-col">
    <div class="px-5 py-4 border-b border-neutral-100">
      <h2 class="text-lg font-semibold text-neutral-900 text-center">Add Family Member</h2>
      <p class="text-sm text-neutral-500 text-center mt-1">
        Select which family member to add to
        <span class="font-medium text-neutral-700">{{ targetName }}</span>:
      </p>
    </div>

    <div class="flex-1 overflow-y-auto py-3 px-4 space-y-2">
      <button
        v-for="type in MEMBER_TYPES"
        :key="type.key"
        class="flex items-center justify-between w-full px-4 py-3 rounded-2xl border transition-colors text-left"
        :class="isRowDisabled(type)
          ? 'border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed'
          : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer'"
        :disabled="isRowDisabled(type)"
        :title="rowDisabledReason(type) ?? undefined"
        @click="!isRowDisabled(type) && $emit('select', type)"
      >
        <span class="flex flex-col gap-0.5 min-w-0">
          <span
            class="text-sm font-medium"
            :class="isRowDisabled(type) ? 'text-neutral-400' : 'text-neutral-800'"
          >
            {{ type.label }}
          </span>
          <!-- Context label: "Will be added as your Uncle" -->
          <span
            v-if="contextLabel(type)"
            class="text-xs leading-tight"
            :class="isRowDisabled(type) ? 'text-neutral-400' : 'text-primary-600'"
          >
            {{ isRowDisabled(type) ? rowDisabledReason(type) : contextLabel(type) }}
          </span>
        </span>

        <span v-if="!isRowDisabled(type)" class="text-sm font-semibold text-primary-700 shrink-0 ml-3">
          Add
        </span>
        <span v-else class="text-xs text-neutral-400 shrink-0 ml-3">Unavailable</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import { useProfileStore } from '@/stores/profile.store'
import { MEMBER_TYPES } from './member-type.config'
import type { MemberTypeConfig, MemberTypeKey } from './member-type.config'
import type { ContextualResult } from './context-relation.config'
import type { FamilyMemberInterface } from '@/types/family-tree.types'

const props = defineProps<{
  contextMappings?: Partial<Record<MemberTypeKey, ContextualResult>> | null
  contextMember?: FamilyMemberInterface | null
}>()

defineEmits<{
  (e: 'select', type: MemberTypeConfig): void
}>()

const familyTreeStore = useFamilyTreeStore()
const profileStore = useProfileStore()

const hasContext = computed(() => !!props.contextMappings)

/** Name shown in the subtitle: context member's name, or "you" for Self. */
const targetName = computed(() => {
  if (props.contextMember) {
    const m = props.contextMember
    return (m.first_name || m.full_name || '').trim() || 'them'
  }
  return profileStore.userDetails?.first_name || 'you'
})

/** Flat list of all members for singleOnly checks. */
const flatTree = computed(() =>
  (familyTreeStore.flatFamilyTree as FamilyMemberInterface[]).filter(
    (m) => m.relationship_metadata?.relation_type,
  ),
)

/** Context label to show under the tile name. */
const contextLabel = (type: MemberTypeConfig): string | null => {
  if (!hasContext.value || !props.contextMappings) return null
  const entry = props.contextMappings[type.key as MemberTypeKey]
  if (!entry) return null
  return entry.contextLabel || null
}

/** Whether a row should be rendered disabled. */
const isRowDisabled = (type: MemberTypeConfig): boolean => {
  if (hasContext.value) {
    if (!props.contextMappings) return true
    const entry = props.contextMappings[type.key as MemberTypeKey]
    if (!entry) return true
    if (entry.disabled) return true
    if (entry.singleOnly) {
      return flatTree.value.some(
        (m) => m.relationship_metadata?.relation_type === entry.relation_type,
      )
    }
    return false
  }

  // Default (self) flow: use the existing singleOnly check
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

/** Reason string for a disabled row (shown in title tooltip and inline). */
const rowDisabledReason = (type: MemberTypeConfig): string | null => {
  if (!hasContext.value || !props.contextMappings) return null
  const entry = props.contextMappings[type.key as MemberTypeKey]
  if (!entry) return null
  if (entry.disabled && entry.disabledReason) return entry.disabledReason
  if (entry.singleOnly) {
    const occupied = flatTree.value.some(
      (m) => m.relationship_metadata?.relation_type === entry.relation_type,
    )
    if (occupied) return 'Already added'
  }
  return null
}
</script>
