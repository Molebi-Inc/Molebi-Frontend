<template>
  <MlbModal :show="show" :max-width="420" :bottom-sheet="isMobile" :bottom-sheet-height="380"
    @update:show="$emit('update:show', false)">
    <template #header>
      <div class="flex items-center justify-between">
        <div />
        <button
          class="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors"
          @click="$emit('update:show', false)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </template>

    <div class="flex flex-col items-center gap-1 pb-2">
      <!-- Avatar -->
      <div class="relative mb-2">
        <div class="w-20 h-20 rounded-full overflow-hidden"
          :style="{ border: isSelf ? '3px solid #16a34a' : '2.5px solid #16a34a' }">
          <img :src="avatarSrc" :alt="displayName" class="w-full h-full object-cover" @error="fallbackUsed = true" />
        </div>
        <div v-if="isDeceased" class="absolute inset-0 rounded-full pointer-events-none"
          style="background: rgba(0,0,0,0.22)" />
      </div>

      <!-- Name + relation -->
      <h3 class="text-lg font-bold text-neutral-900 text-center leading-tight">{{ displayName }}</h3>
      <p v-if="relationLabel" class="text-sm text-neutral-500 mb-3">{{ relationLabel }}</p>

      <!-- Action buttons -->
      <div class="w-full space-y-3 mt-2">
        <button
          class="w-full py-3.5 rounded-full border border-primary-600 text-primary-700 font-medium text-sm hover:bg-primary-50 transition-colors"
          @click="onViewFullProfile">
          View Full Profile
        </button>
        <button
          class="w-full py-3.5 rounded-full border border-primary-600 text-primary-700 font-medium text-sm hover:bg-primary-50 transition-colors"
          @click="onAddRelatives">
          Add Relatives
        </button>
        <button
          class="w-full py-3.5 rounded-full border border-primary-600 text-primary-700 font-medium text-sm hover:bg-primary-50 transition-colors"
          @click="onViewBranch">
          View Branch
        </button>
      </div>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import MlbModal from '@/components/ui/MlbModal.vue'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { getUserAvatar } from '@/helpers/general.helpers'
import maleMemberSvg from '@/assets/svg/member/male.svg?url'
import femaleMemberSvg from '@/assets/svg/member/female.svg?url'

type ExtendedMember = FamilyMemberInterface & {
  is_deceased?: boolean | null
  _isSelf?: boolean
}

const props = defineProps<{
  show: boolean
  member: ExtendedMember
  isSelf?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
  (e: 'view-profile', member: ExtendedMember): void
  (e: 'add-relative', member: ExtendedMember): void
  (e: 'view-branch', member: ExtendedMember): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const fallbackUsed = ref(false)

const isDeceased = computed(() => !!props.member.is_deceased)
const isSelf = computed(() => !!(props.isSelf || props.member._isSelf))

const avatarSrc = computed(() => {
  if (!fallbackUsed.value && props.member.profile_picture_url) return props.member.profile_picture_url
  if (props.member.gender === 'male') return maleMemberSvg
  if (props.member.gender === 'female') return femaleMemberSvg
  return getUserAvatar(props.member.first_name, props.member.family_name)
})

const displayName = computed(() => {
  const m = props.member
  return m.full_name || `${m.first_name} ${m.family_name}`.trim() || m.first_name
})

const relationLabel = computed(() => {
  if (isSelf.value) return 'You'
  const rel = props.member.relationship_metadata?.relation_type
  if (!rel) return null
  return rel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
})

const close = () => emit('update:show', false)

const onViewFullProfile = () => {
  close()
  emit('view-profile', props.member)
}

const onAddRelatives = () => {
  close()
  emit('add-relative', props.member)
}

const onViewBranch = () => {
  close()
  emit('view-branch', props.member)
}
</script>
