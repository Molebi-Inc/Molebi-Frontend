<template>
  <div>
    <MlbModal :show="show" :max-width="520" :bottom-sheet="isMobile" :bottom-sheet-height="680"
      class="member-profile-modal rounded-3xl!" header-class="p-0!" @update:show="$emit('update:show', false)">
      <template #header>
        <div class="bg-[#FFFBF8] shadow-lg rounded-3xl p-6">

          <!-- Back to family tree link -->
          <button
            class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4"
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
            <div class="relative" :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }">
              <!-- Blob ring -->
              <div class="absolute inset-0 rounded-full" :style="blobRingStyle" />
              <div class="relative rounded-full overflow-hidden z-10" :style="{
                width: avatarSize + 'px',
                height: avatarSize + 'px',
                border: isSelf ? '3px solid #16a34a' : '2.5px solid transparent',
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }">
                <img :src="avatarSrc" :alt="resolvedMember.full_name ?? resolvedMember.first_name" class="object-cover"
                  @error="onAvatarError" />
              </div>
              <div v-if="isDeceased" class="absolute inset-0 rounded-full z-20 pointer-events-none"
                style="background: rgba(0,0,0,0.25)" />
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
            <NDropdown trigger="click" placement="bottom-end" :options="actionOptions" @select="onActionSelect">
              <button
                class="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path
                    d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                </svg>
              </button>
            </NDropdown>
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

    <MlbModal :show="showDeleteConfirm" :max-width="560" @update:show="showDeleteConfirm = false"
      class="rounded-3xl! md:p-8!">
      <template #header>
        <button class="text-neutral-600 hover:text-neutral-800 transition-colors text-sm"
          @click="showDeleteConfirm = false">
          Cancel
        </button>
      </template>
      <div class="px-3 pb-2">
        <div class="mx-auto w-20 h-20 rounded-full bg-[#FCE9E9] flex items-center justify-center mb-6">
          <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.3115 8.58792H20.0362C22.8985 8.58792 22.8985 7.15676 22.8985 5.7256C22.8985 2.86328 21.4673 2.86328 20.0362 2.86328H14.3115C12.8804 2.86328 11.4492 2.86328 11.4492 5.7256C11.4492 8.58792 12.8804 8.58792 14.3115 8.58792Z"
              stroke="#C20000" stroke-width="1.93207" stroke-miterlimit="10" stroke-linecap="round"
              stroke-linejoin="round" />
            <path
              d="M22.8985 5.75391C27.6643 6.01151 30.0543 7.77184 30.0543 14.3122V22.8992C30.0543 28.6238 28.6232 31.4862 21.4674 31.4862H12.8804C5.72462 31.4862 4.29346 28.6238 4.29346 22.8992V14.3122C4.29346 7.78615 6.68349 6.01151 11.4493 5.75391"
              stroke="#C20000" stroke-width="1.93207" stroke-miterlimit="10" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>

        </div>
        <p class="text-center text-neutral-700 font-semibold">
          Are you sure you want to delete
          <br>
          {{ resolvedMember.full_name || `${resolvedMember.first_name} ${resolvedMember.family_name}`.trim() }}
          from the family tree?
        </p>
      </div>
      <template #footer>
        <div class="grid grid-cols-2 gap-4 pb-3">
          <button
            class="h-10 rounded-2xl bg-[#FCE9E9] text-[#C20000] text-sm font-semibold hover:bg-[#f8dede] transition-colors"
            :disabled="props.deleteLoading" :class="props.deleteLoading ? 'opacity-70 cursor-not-allowed' : ''"
            @click="onConfirmDelete">
            {{ props.deleteLoading ? 'Deleting...' : 'Yes' }}
          </button>
          <button
            class="h-10 rounded-2xl border border-[#C20000] bg-white text-[#C20000] text-sm font-semibold hover:bg-[#fff7f7] transition-colors"
            @click="showDeleteConfirm = false">
            No
          </button>
        </div>
      </template>
    </MlbModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { NDropdown } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { getUserAvatar } from '@/helpers/general.helpers'
import { useGetFamilyMemberQuery } from '@/services/family-tree.service'
import maleMemberSvg from '@/assets/svg/member/male.svg?url'
import femaleMemberSvg from '@/assets/svg/member/female.svg?url'
import nodeBlobUrl from '@/assets/images/node-blob.png?url'
import MemberTimelineSection from './MemberTimelineSection.vue'
import MemberBiographySection from './MemberBiographySection.vue'
import MemberTaggedMediaSection from './MemberTaggedMediaSection.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'

type ExtendedMember = FamilyMemberInterface & {
  biography?: string | null
  date_of_birth?: string | null
  is_deceased?: boolean | null
  _isSelf?: boolean
}

const props = withDefaults(defineProps<{
  show: boolean
  member: ExtendedMember
  isSelf?: boolean
  deleteLoading?: boolean
}>(), {
  isSelf: false,
  deleteLoading: false,
})

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
  /** Scroll/highlight this member in the tree canvas */
  (e: 'view-in-tree', member: FamilyMemberInterface): void
  /** Open the edit member modal */
  (e: 'edit', member: FamilyMemberInterface): void
  /** Open the add-relative flow with this member as context */
  (e: 'add-relative', member: FamilyMemberInterface): void
  /** Confirmed delete action for this member */
  (e: 'delete', member: FamilyMemberInterface): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const profilePictureFailed = ref(false)
const genderPlaceholderFailed = ref(false)
const avatarSize = 80
const BLOB_RING_SCALE = 1.35
const showDeleteConfirm = ref(false)

const actionOptions = computed(() => [
  {
    key: 'delete',
    label: () =>
      h('div', { class: 'flex items-center gap-2' }, [
        h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', class: 'w-5 h-5 text-[#C20000]' }, [
          h('path', {
            d: 'M9.5 5H14.5M3 7H21M19.2 7L18.56 16.59C18.41 18.76 18.33 19.84 17.72 20.61C17.42 20.99 17.03 21.27 16.59 21.43C15.7 21.75 14.62 21.75 12.47 21.75H11.53C9.38 21.75 8.3 21.75 7.41 21.43C6.97 21.27 6.58 20.99 6.28 20.61C5.67 19.84 5.59 18.76 5.44 16.59L4.8 7M10.5 11V16.5M13.5 11V16.5',
            stroke: 'currentColor',
            'stroke-width': '1.8',
            'stroke-linecap': 'round',
          }),
        ]),
        h('span', { class: 'text-gray-700' }, 'Delete this person'),
      ]),
  },
])

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
    profilePictureFailed.value = false
    genderPlaceholderFailed.value = false
  },
)

watch(
  () => props.show,
  (visible) => {
    if (!visible) showDeleteConfirm.value = false
  },
)

// Local bio override (after a successful biography save)
const localBio = ref<string | null>(null)

const memberWithBio = computed<ExtendedMember>(() => ({
  ...resolvedMember.value,
  biography: localBio.value !== null ? localBio.value : (resolvedMember.value as any).biography,
}))

const avatarSrc = computed(() => {
  const m = resolvedMember.value
  const profile = m.profile_picture_url
  if (profile != null && String(profile).trim() !== '' && !profilePictureFailed.value) {
    return profile
  }
  if (!genderPlaceholderFailed.value) {
    if (m.gender === 'male') return maleMemberSvg
    if (m.gender === 'female') return femaleMemberSvg
  }
  return getUserAvatar(m.first_name, m.family_name)
})

const onAvatarError = () => {
  const m = resolvedMember.value
  const profile = m.profile_picture_url
  const hasProfile =
    profile != null && String(profile).trim() !== '' && !profilePictureFailed.value
  if (hasProfile) {
    profilePictureFailed.value = true
    return
  }
  if ((m.gender === 'male' || m.gender === 'female') && !genderPlaceholderFailed.value) {
    genderPlaceholderFailed.value = true
  }
}

const isDeceased = computed(() => !!(resolvedMember.value as any).is_deceased)
const blobRingStyle = computed(() => ({
  padding: '3px',
  borderRadius: '50%',
  transform: `scale(${BLOB_RING_SCALE})`,
  transformOrigin: 'center center',
  backgroundImage: `url(${nodeBlobUrl})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: 'contain',
}))

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

const onActionSelect = (key: string) => {
  if (key === 'delete') showDeleteConfirm.value = true
}

const onConfirmDelete = () => {
  if (props.deleteLoading) return
  emit('delete', resolvedMember.value)
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