<template>
  <div class="flex flex-col gap-3">
    <!-- Search -->
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="15" height="15" viewBox="0 0 15 15"
        fill="none">
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.3" />
        <path d="M10 10L13 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
      </svg>
      <input v-model="query" type="text" :placeholder="placeholder"
        class="w-full pl-8 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
    </div>

    <!-- Member list -->
    <div
      class="flex flex-col divide-y divide-neutral-100 max-h-[240px] overflow-y-auto rounded-xl border border-neutral-100">
      <div v-if="!filteredMembers.length && query.trim()" class="py-6 text-center text-sm text-neutral-400">
        No members found
      </div>
      <div v-if="filteredMembers.length && query.trim()">
        <button v-for="member in filteredMembers" :key="member.id" type="button"
          class="flex items-center gap-3 px-3 py-3 text-left transition-colors w-full"
          :class="isSelected(member.id) ? 'bg-primary-50' : 'hover:bg-neutral-50'" @click="$emit('toggle', member.id!)">
          <!-- Avatar -->
          <div class="w-9 h-9 rounded-full shrink-0 overflow-hidden bg-neutral-200 flex items-center justify-center">
            <img v-if="member.profile_picture_url" :src="member.profile_picture_url"
              class="w-full h-full object-cover" />
            <span v-else class="text-xs font-semibold text-neutral-500 uppercase">
              {{ (member.first_name?.[0] ?? '') + (member.family_name?.[0] ?? '') }}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-neutral-900 truncate">{{ member.full_name ?? member.first_name + ' ' +
              member.family_name }}</p>
            <p v-if="showRelation" class="text-xs text-neutral-400 truncate capitalize">
              {{ member.relationship_metadata?.relation_type ?? '' }}
            </p>
          </div>

          <!-- Selection indicator -->
          <div v-if="isSelected(member.id)"
            class="w-5 h-5 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </button>

      </div>
      <!-- Selected members list -->
      <div v-if="selected.length && showSelectedMembers" class="flex flex-col gap-3">
        <MlbAvatar :options="{ firstname_field: 'first_name', lastname_field: 'family_name', users: selectedMembers }"
          :size="24" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGeneralStore } from '@/stores/general.store'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { useHome } from '@/composables/useHome'
import MlbAvatar from '@/components/ui/MlbAvatar.vue';

const props = withDefaults(
  defineProps<{
    selected: number[]
    showRelation?: boolean
    placeholder?: string
    showSelectedMembers?: boolean
  }>(),
  { showRelation: false, placeholder: 'Search name', showSelectedMembers: false },
)

defineEmits<{ (e: 'toggle', id: number): void }>()

const query = ref('')
const generalStore = useGeneralStore()
const { fetchFamilyMembers } = useHome()

const members = computed(() => generalStore.familyMembers as FamilyMemberInterface[])

const filteredMembers = computed(() => {
  if (!query.value.trim()) return members.value
  const q = query.value.toLowerCase()
  return members.value.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(q) ||
      m.first_name?.toLowerCase().includes(q) ||
      m.family_name?.toLowerCase().includes(q),
  )
})

const isSelected = (id: number | undefined) => id !== undefined && props.selected.includes(id)

const selectedMembers = computed(() => {
  return members.value.filter((m) => props.selected.includes(m.id ?? -1))
})

onMounted(() => {
  if (!generalStore.familyMembers.length) {
    fetchFamilyMembers()
  }
})
</script>
