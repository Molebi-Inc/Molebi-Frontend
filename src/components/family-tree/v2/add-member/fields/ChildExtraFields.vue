<template>
  <div>
    <label class="block text-sm font-medium text-neutral-600 mb-2">
      Who is {{ childFirstName ? `${childFirstName}'s` : "the child's" }} other parent?
    </label>
    <div class="relative">
      <select
        :value="modelValue.second_parent_id ?? ''"
        class="w-full appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors pr-10"
        @change="handleChange(($event.target as HTMLSelectElement).value)"
      >
        <option value="">Select parent</option>
        <optgroup v-if="spouseOptions.length" label="Your partner(s)">
          <option
            v-for="opt in spouseOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </optgroup>
        <option value="new_parent">Add new parent</option>
        <option :value="noSecondParentValue">{{ noSecondParentLabel }}</option>
      </select>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
      >
        <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import { useProfileStore } from '@/stores/profile.store'
import type { V2MemberFormData } from '../member-type.config'

interface Props {
  modelValue: V2MemberFormData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: V2MemberFormData): void
}>()

const familyTreeStore = useFamilyTreeStore()
const profileStore = useProfileStore()

const childFirstName = computed(() => props.modelValue.first_name || '')

/** The logged-in user's gender, used to determine no-second-parent label */
const myGender = computed(() => profileStore.userDetails?.gender ?? null)

const noSecondParentValue = 'no_second_parent'

const noSecondParentLabel = computed(() => {
  if (myGender.value === 'male') return 'No mother (single father)'
  if (myGender.value === 'female') return 'No father (single mother)'
  return 'No second parent (single parent)'
})

const spouseOptions = computed(() => {
  const spouses = familyTreeStore.familyTreeData?.familyTree?.spouse ?? []
  return spouses
    .filter((s) => !s.relationship_metadata?.is_former)
    .map((s) => ({
      label: s.full_name || `${s.first_name ?? ''} ${s.family_name ?? ''}`.trim() || 'Partner',
      value: s.id as number,
    }))
})

const handleChange = (raw: string) => {
  let value: V2MemberFormData['second_parent_id']
  if (raw === 'new_parent') value = 'new_parent'
  else if (raw === 'no_second_parent') value = 'no_second_parent'
  else if (raw === '') value = null
  else value = Number(raw)
  emit('update:modelValue', { ...props.modelValue, second_parent_id: value })
}
</script>
