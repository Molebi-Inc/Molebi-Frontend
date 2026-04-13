<template>
  <div class="space-y-5">
    <!-- Related through -->
    <div>
      <label class="block text-sm font-medium text-neutral-600 mb-2">
        Related through
      </label>
      <div class="relative">
        <select :value="sharedParentsValue" placeholder="Select an option"
          class="w-full appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors pr-10"
          @change="onSharedParentsChange">
          <option v-for="opt in availableParents" :key="String(opt.value)" :value="opt.value ?? ''">
            {{ opt.label }}
          </option>
        </select>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none">
          <path fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-neutral-600 mb-2">
        Add Father/Mother
      </label>
      <div class="relative">
        <select :value="modelValue.parent_id ?? ''"
          class="w-full appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors pr-10"
          @change="onSiblingParentChange">
          <option value="">Select parent</option>
          <option v-for="p in availableStepParents" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none">
          <path fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import type { V2MemberFormData } from '../member-type.config'

interface Props {
  modelValue: V2MemberFormData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: V2MemberFormData): void
}>()

const familyTreeStore = useFamilyTreeStore()

const update = <K extends keyof V2MemberFormData>(key: K, value: V2MemberFormData[K]) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const sharedParentsValue = computed(() => props.modelValue.shared_parents ?? '')

const onSharedParentsChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as V2MemberFormData['shared_parents']
  update('shared_parents', value)
}

const onSiblingParentChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  update('parent_id', value ? Number(value) : null)
}

const availableParents = computed(() => {
  const parents = familyTreeStore.familyTreeData?.familyTree?.parents ?? []
  return parents
    .filter((p) => {
      const rt = p.relationship_metadata?.relation_type
      if (props.modelValue.shared_parents === 'father_only') return rt === 'father'
      if (props.modelValue.shared_parents === 'mother_only') return rt === 'mother'
      return true
    })
    .map((p) => ({
      label: p.full_name || `${p.first_name ?? ''} ${p.family_name ?? ''}`.trim() || 'Parent',
      value: p.id as number,
    }))
})

const availableStepParents = computed(() => {
  const parents = familyTreeStore.familyTreeData?.familyTree?.parents ?? []
  return parents
    .filter((p) => {
      const rt = p.relationship_metadata?.relation_type
      return rt === 'stepfather' || rt === 'stepmother' || rt === 'step_parents'
    })
    .map((p) => ({
      label: p.full_name || `${p.first_name ?? ''} ${p.family_name ?? ''}`.trim() || 'Parent',
      value: p.id as number,
    }))
})
</script>
