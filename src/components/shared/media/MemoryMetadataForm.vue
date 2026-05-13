<template>
  <div class="flex flex-col gap-6">
    <!-- Title -->
    <input v-model="form.title" type="text" placeholder="Add a Title..."
      class="w-full h-9 text-lg font-semibold text-neutral-900 placeholder-neutral-300 border-0 border-b border-neutral-100 pb-2 focus:outline-none focus:border-primary-400 bg-transparent" />
    <n-input v-model:value="form.description" type="textarea" placeholder="Write something about this memory..."
      rows="3" class="w-full borderless" />

    <!-- Location -->
    <div class="flex items-center gap-3 py-3 px-1 border-b border-neutral-100 pb-3">
      <n-select class="location-select flex-1 min-w-0" v-model:value="locationSelectValue" :options="locationOptions"
        :bordered="false" filterable placeholder="Add location" clearable />
      <div class="flex items-center gap-3 text-neutral-500 min-w-[18px]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 1.5C6.1 1.5 3.75 3.85 3.75 6.75C3.75 10.5 9 16.5 9 16.5C9 16.5 14.25 10.5 14.25 6.75C14.25 3.85 11.9 1.5 9 1.5ZM9 8.625C7.97 8.625 7.125 7.78 7.125 6.75C7.125 5.72 7.97 4.875 9 4.875C10.03 4.875 10.875 5.72 10.875 6.75C10.875 7.78 10.03 8.625 9 8.625Z"
            fill="currentColor" />
        </svg>
      </div>
    </div>

    <!-- Tag Family Members -->
    <!-- <FamilyMemberPicker class="family-picker-bottom-only" placeholder="Tag Family Members" :show-selected-members="true"
      :selected="form.family_member_ids" @toggle="toggleMember" /> -->
    <div class="flex items-center gap-3 border-b border-neutral-100 pb-3">
      <MlbUserSelector class="location-select" :family-members="familyMembers" :model-value="form.family_member_ids"
        @update:model-value="toggleMember" />
      <MlbIcon name="tag_2" :size="18" />
    </div>

    <!-- Add Date -->
    <n-date-picker v-model:formatted-value="form.event_date" id="event_date" name="event_date" type="date"
      :is-date-disabled="dateDisabled" placeholder="Add Date" class="w-full date-picker-bottom-only" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NInput, NDatePicker, NSelect } from 'naive-ui'
// import FamilyMemberPicker from '@/components/shared/media/FamilyMemberPicker.vue'
import { useGetStatesQuery } from '@/services/general.service'
import type { CreateMemoryValues } from '@/types/memory.types'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { useGeneralStore } from '@/stores/general.store'
import MlbUserSelector from '@/components/ui/MlbUserSelector.vue'
import { useHome } from '@/composables/useHome'
import MlbIcon from '@/components/ui/MlbIcon.vue'

const baseLocationOptions = [
  { label: 'New York, United States', value: 'New York, United States' },
  { label: 'Los Angeles, United States', value: 'Los Angeles, United States' },
  { label: 'Chicago, United States', value: 'Chicago, United States' },
  { label: 'Toronto, Canada', value: 'Toronto, Canada' },
  { label: 'Vancouver, Canada', value: 'Vancouver, Canada' },
  { label: 'Mexico City, Mexico', value: 'Mexico City, Mexico' },
  { label: 'London, United Kingdom', value: 'London, United Kingdom' },
  { label: 'Manchester, United Ki/ngdom', value: 'Manchester, United Kingdom' },
  { label: 'Paris, France', value: 'Paris, France' },
  { label: 'Berlin, Germany', value: 'Berlin, Germany' },
  { label: 'Rome, Italy', value: 'Rome, Italy' },
  { label: 'Barcelona, Spain', value: 'Barcelona, Spain' },
  { label: 'Amsterdam, Netherlands', value: 'Amsterdam, Netherlands' },
  { label: 'Madrid, Spain', value: 'Madrid, Spain' },
  { label: 'Istanbul, Turkey', value: 'Istanbul, Turkey' },
  { label: 'Cairo, Egypt', value: 'Cairo, Egypt' },
  { label: 'Nairobi, Kenya', value: 'Nairobi, Kenya' },
  { label: 'Johannesburg, South Africa', value: 'Johannesburg, South Africa' },
  { label: 'Rio de Janeiro, Brazil', value: 'Rio de Janeiro, Brazil' },
  { label: 'Sao Paulo, Brazil', value: 'Sao Paulo, Brazil' },
  { label: 'Mumbai, India', value: 'Mumbai, India' },
  { label: 'Delhi, India', value: 'Delhi, India' },
  { label: 'Bengaluru, India', value: 'Bengaluru, India' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Bangkok, Thailand', value: 'Bangkok, Thailand' },
  { label: 'Dubai, United Arab Emirates', value: 'Dubai, United Arab Emirates' },
  { label: 'Tokyo, Japan', value: 'Tokyo, Japan' },
  { label: 'Osaka, Japan', value: 'Osaka, Japan' },
  { label: 'Seoul, South Korea', value: 'Seoul, South Korea' },
  { label: 'Sydney, Australia', value: 'Sydney, Australia' },
  { label: 'Melbourne, Australia', value: 'Melbourne, Australia' },
]

const statesQuery = useGetStatesQuery()
const generalStore = useGeneralStore()
const { fetchFamilyMembers } = useHome()

const locationOptions = computed(() => {
  const stateOptions = (statesQuery.data.value?.data ?? []).map((state) => {
    const label = `${state.name}, Nigeria`
    return { label, value: label }
  })

  const merged = [...baseLocationOptions, ...stateOptions]
  // Deduplicate by value while preserving order.
  return merged.filter((opt, idx, arr) => arr.findIndex((item) => item.value === opt.value) === idx)
})
const familyMembers = computed<FamilyMemberInterface[]>(() => generalStore.familyMembers)


const form = defineModel<CreateMemoryValues>('modelValue', {
  default: () => ({ title: '', description: '', family_member_ids: [], event_date: null, files: [], metadata: { location: '' } }),
})

/** NSelect only shows placeholder when value is null/undefined, not ''. */
const locationSelectValue = computed<string | null>({
  get: () => form.value.metadata.location || null,
  set: (v) => {
    form.value.metadata.location = v ?? ''
  },
})
const dateDisabled = (ts: number) => {
  // Disable dates after today (future dates)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
  const selectedDate = new Date(ts)
  if (Number.isNaN(selectedDate.getTime())) return false
  selectedDate.setHours(0, 0, 0, 0)
  return selectedDate > today
}

const toggleMember = (value: number[]) => {
  form.value.family_member_ids = value
}

onMounted(() => {
  if (!generalStore.familyMembers.length) {
    fetchFamilyMembers()
  }
})
</script>
<style scoped>
:deep(.n-input.borderless) {
  --n-border: none !important;
  --n-border-hover: none !important;
  --n-border-focus: none !important;
  --n-box-shadow-focus: none !important;
}

:deep(.family-picker-bottom-only input) {
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

:deep(.family-picker-bottom-only svg) {
  left: auto !important;
  right: 0 !important;
}

:deep(.date-picker-bottom-only .n-input) {
  --n-border: none !important;
  --n-border-hover: none !important;
  --n-border-focus: none !important;
  --n-box-shadow-focus: none !important;
}

:deep(.date-picker-bottom-only .n-input-wrapper) {
  border-radius: 0 !important;
  border: 0 !important;
  border-bottom: 1px solid rgb(229 229 229) !important;
  box-shadow: none !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

:deep(.location-select .n-base-selection) {
  --n-border: none !important;
  --n-border-hover: none !important;
  --n-border-active: none !important;
  --n-border-focus: none !important;
  --n-box-shadow-focus: none !important;
}
</style>