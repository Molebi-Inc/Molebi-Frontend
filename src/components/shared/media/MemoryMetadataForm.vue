<template>
  <div class="flex flex-col gap-1">
    <!-- Title -->
    <input
      v-model="form.title"
      type="text"
      placeholder="Add a Title..."
      class="w-full text-lg font-semibold text-neutral-900 placeholder-neutral-300 border-0 border-b border-neutral-100 pb-2 focus:outline-none focus:border-primary-400 bg-transparent"
    />
    <p class="text-xs text-neutral-400 mb-3">Write something about this memory</p>

    <!-- Location -->
    <button
      type="button"
      class="flex items-center justify-between py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors rounded-lg px-1"
      @click="$emit('add-location')"
    >
      <div class="flex items-center gap-3 text-neutral-500">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 1.5C6.1 1.5 3.75 3.85 3.75 6.75C3.75 10.5 9 16.5 9 16.5C9 16.5 14.25 10.5 14.25 6.75C14.25 3.85 11.9 1.5 9 1.5ZM9 8.625C7.97 8.625 7.125 7.78 7.125 6.75C7.125 5.72 7.97 4.875 9 4.875C10.03 4.875 10.875 5.72 10.875 6.75C10.875 7.78 10.03 8.625 9 8.625Z" fill="currentColor" />
        </svg>
        <span class="text-sm">{{ form.location || 'Add Location' }}</span>
      </div>
      <span class="text-xs text-primary-600 font-medium">Add</span>
    </button>

    <!-- Tag Family Members -->
    <button
      type="button"
      class="flex items-center justify-between py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors rounded-lg px-1"
      @click="showMembersSheet = true"
    >
      <div class="flex items-center gap-3 text-neutral-500">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="5.25" r="2.25" fill="currentColor" />
          <path d="M1.5 15C1.5 12.1 4.1 9.75 7 9.75C9.9 9.75 12.5 12.1 12.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="13" cy="5.25" r="1.75" fill="currentColor" fill-opacity="0.5" />
          <path d="M15 14C15 12.3 14.1 10.8 12.75 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span class="text-sm">
          {{ form.family_member_ids.length ? `${form.family_member_ids.length} member(s) tagged` : 'Tag Family Members' }}
        </span>
      </div>
      <span class="text-xs text-primary-600 font-medium">Add</span>
    </button>

    <!-- Add Date -->
    <button
      type="button"
      class="flex items-center justify-between py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors rounded-lg px-1"
      @click="showDatePicker = !showDatePicker"
    >
      <div class="flex items-center gap-3 text-neutral-500">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="2.25" width="15" height="14.25" rx="2" stroke="currentColor" stroke-width="1.3" />
          <path d="M1.5 6.75H16.5" stroke="currentColor" stroke-width="1.3" />
          <path d="M5.25 1.5V3M12.75 1.5V3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
        <span class="text-sm">{{ form.event_date || 'Add Date' }}</span>
      </div>
      <span class="text-xs text-primary-600 font-medium">Add</span>
    </button>

    <!-- Inline date input (shown when date button clicked) -->
    <input
      v-if="showDatePicker"
      v-model="form.event_date"
      type="date"
      class="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      @blur="showDatePicker = false"
    />

    <!-- Family members selector sheet -->
    <div
      v-if="showMembersSheet && familyMembers.length"
      class="mt-2 border border-neutral-200 rounded-xl overflow-hidden"
    >
      <div
        v-for="member in familyMembers"
        :key="member.id"
        class="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-0"
        @click="toggleMember(member.id)"
      >
        <div
          class="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
          :class="form.family_member_ids.includes(member.id ?? -1) ? 'bg-primary-700 border-primary-700' : 'border-neutral-300'"
        >
          <svg v-if="form.family_member_ids.includes(member.id ?? -1)" width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 5L4 7L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span class="text-sm text-neutral-800">{{ member.full_name || member.first_name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGeneralStore } from '@/stores/general.store'
import type { FamilyMemberInterface } from '@/types/family-tree.types'

export interface MemoryMetadata {
  title: string
  location: string
  family_member_ids: number[]
  event_date: string
}

const form = defineModel<MemoryMetadata>('modelValue', {
  default: () => ({ title: '', location: '', family_member_ids: [], event_date: '' }),
})

defineEmits<{ (e: 'add-location'): void }>()

const generalStore = useGeneralStore()
const showDatePicker = ref(false)
const showMembersSheet = ref(false)

const familyMembers = computed(() => generalStore.familyMembers as FamilyMemberInterface[])

const toggleMember = (id: number | undefined) => {
  if (id === undefined) return
  const ids = form.value.family_member_ids
  const idx = ids.indexOf(id)
  if (idx === -1) {
    form.value = { ...form.value, family_member_ids: [...ids, id] }
  } else {
    form.value = { ...form.value, family_member_ids: ids.filter((i) => i !== id) }
  }
}
</script>
