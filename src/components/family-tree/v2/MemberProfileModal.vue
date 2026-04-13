<template>
  <MlbModal :show="show" :max-width="520" :bottom-sheet="isMobile" :bottom-sheet-height="680"
    class="member-profile-modal rounded-3xl!" header-class="p-0!" @update:show="$emit('update:show', false)">
    <template #header>
      <div class="bg-[#FFFBF8] shadow-lg rounded-3xl p-6">

        <!-- Back to family tree link -->
        <button class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4"
          @click="$emit('update:show', false)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clip-rule="evenodd" />
          </svg>
          Back to Family Tree
        </button>

        <!-- Avatar + name + meta -->
        <div class="flex flex-col items-center gap-2 pb-2">
          <div class="relative">
            <!-- Blob ring -->
            <div class="absolute inset-0 rounded-full" :style="{
              padding: '3px',
              background: isDeceased ? '#9ca3af' : 'radial-gradient(circle at 30% 30%, #fde68a, #f97316 70%)',
              borderRadius: '50%',
              transform: 'scale(1.12)',
            }" />
            <div class="relative w-20 h-20 rounded-full overflow-hidden z-10" :style="{
              border: isSelf ? '3px solid #16a34a' : '2.5px solid transparent',
            }">
              <img :src="avatarSrc" :alt="resolvedMember.full_name ?? resolvedMember.first_name"
                class="w-full h-full object-cover" @error="fallbackUsed = true" />
            </div>
            <div v-if="isDeceased" class="absolute inset-0 rounded-full z-20 pointer-events-none"
              style="background:rgba(0,0,0,0.22)" />
          </div>

          <h2 class="text-xl font-bold text-neutral-900 text-center leading-tight">
            {{ resolvedMember.full_name || `${resolvedMember.first_name} ${resolvedMember.family_name}`.trim() }}
          </h2>
          <p v-if="relationLabel" class="text-sm text-neutral-500">{{ relationLabel }}</p>
          <p v-if="dobDisplay" class="text-sm text-neutral-500">{{ dobDisplay }}</p>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-center gap-2 flex-wrap mt-2">
          <button
            class="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            @click="onViewInTree">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              class="w-4 h-4 text-neutral-500">
              <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path fill-rule="evenodd"
                d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                clip-rule="evenodd" />
            </svg>
            View in Tree
          </button>
          <button
            class="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            @click="$emit('edit', resolvedMember)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              class="w-4 h-4 text-neutral-500">
              <path
                d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path
                d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
            Edit
          </button>
          <button
            class="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            @click="$emit('add-relative', resolvedMember)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              class="w-4 h-4 text-neutral-500">
              <path
                d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Add relative
          </button>
          <!-- <button
            class="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path
                d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
            </svg>
          </button> -->
        </div>
      </div>
    </template>

    <!-- Accordion sections -->
    <div class="-mx-6 -mb-4">
      <!-- Timeline -->
      <MemberTimelineSection v-if="resolvedMember.id" :member-id="Number(resolvedMember.id)"
        :member-first-name="resolvedMember.first_name" />

      <!-- Biography -->
      <MemberBiographySection :member="memberWithBio" @updated="localBio = $event" />

      <MemberTaggedMediaSection v-if="resolvedMember.id" :items="taggedMediaItems" :loading="memoriesLoading" />

      <!-- Immediate Family (empty state for now) -->
      <div class="border-t border-neutral-100">
        <div class="flex items-center justify-between px-5 py-4">
          <span class="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Immediate Family</span>
          <!-- <button class="text-sm font-semibold text-primary-700">+ Add</button> -->
        </div>
        <div class="px-5 pb-5 text-sm text-neutral-400 text-center">No immediate family data yet.</div>
      </div>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import MlbModal from '@/components/ui/MlbModal.vue'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { getUserAvatar } from '@/helpers/general.helpers'
import { useGetFamilyMemberQuery } from '@/services/family-tree.service'
import MemberTimelineSection from './MemberTimelineSection.vue'
import MemberBiographySection from './MemberBiographySection.vue'
import MemberTaggedMediaSection from './MemberTaggedMediaSection.vue'

type ExtendedMember = FamilyMemberInterface & {
  biography?: string | null
  date_of_birth?: string | null
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
  /** Scroll/highlight this member in the tree canvas */
  (e: 'view-in-tree', member: FamilyMemberInterface): void
  /** Open the edit member modal */
  (e: 'edit', member: FamilyMemberInterface): void
  /** Open the add-relative flow with this member as context */
  (e: 'add-relative', member: FamilyMemberInterface): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const fallbackUsed = ref(false)

const memberIdStr = computed(() => (props.member.id != null ? String(props.member.id) : ''))

const familyMemberQuery = useGetFamilyMemberQuery(memberIdStr, {
  enabled: computed(() => props.show && memberIdStr.value !== ''),
})

/** Fresh API payload when modal opens; falls back to tree props until loaded. */
const resolvedMember = computed<ExtendedMember>(() => {
  const base = props.member
  const fresh = familyMemberQuery.data.value?.data
  if (!fresh) return base
  return {
    ...base,
    ...fresh,
    relationship_metadata: fresh.relationship_metadata ?? base.relationship_metadata,
    tagged_media: fresh.tagged_media ?? (base as ExtendedMember).tagged_media ?? [],
  }
})

const taggedMediaItems = computed(() => resolvedMember.value.tagged_media ?? [])

const memoriesLoading = computed(() => familyMemberQuery.isLoading.value)

watch(
  () => props.member.id,
  () => {
    fallbackUsed.value = false
  },
)

// Local bio override (after a successful biography save)
const localBio = ref<string | null>(null)

const memberWithBio = computed<ExtendedMember>(() => ({
  ...resolvedMember.value,
  biography: localBio.value !== null ? localBio.value : (resolvedMember.value as any).biography,
}))

const avatarSrc = computed(() =>
  fallbackUsed.value
    ? getUserAvatar(resolvedMember.value.first_name, resolvedMember.value.family_name)
    : (resolvedMember.value.profile_picture_url ||
      getUserAvatar(resolvedMember.value.first_name, resolvedMember.value.family_name)),
)

const isDeceased = computed(() => !!(resolvedMember.value as any).is_deceased)

const relationLabel = computed(() => {
  if (props.isSelf || resolvedMember.value._isSelf) return 'You'
  const rel = resolvedMember.value.relationship_metadata?.relation_type
  if (!rel) return null
  return rel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
})

const dobDisplay = computed(() => {
  const dob = (resolvedMember.value as any).date_of_birth as string | null | undefined
  if (!dob) return null
  const year = new Date(dob).getFullYear()
  const now = new Date().getFullYear()
  const age = now - year
  return `Born: ${year} (Age ~${age})`
})

const onViewInTree = () => {
  emit('view-in-tree', resolvedMember.value)
  emit('update:show', false)
}
</script>
<style scoped>
:deep(.member-profile-modal .n-card > .n-card-header) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

:deep(.member-profile-modal .n-card > .n-card__content) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>