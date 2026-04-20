<template>
  <div class="flex flex-col items-center select-none overflow-visible" :style="rootColumnStyle">
    <!-- Padding reserves in-flow space so scaled blob is not clipped by overflow-x-auto ancestors -->
    <div class="relative shrink-0 overflow-visible" :style="avatarStackPaddingStyle">
      <div class="relative mx-auto" :style="{ width: size + 'px', height: size + 'px' }">
        <!-- Outer decorative blob ring -->
        <div class="absolute inset-0 rounded-full" :style="blobRingStyle" />

        <!-- Avatar circle (clickable — opens member profile) -->
        <div class="relative rounded-full overflow-hidden z-10 cursor-pointer"
          :class="highlighted ? 'ring-4 ring-primary-400 ring-offset-2 animate-pulse' : ''" :style="{
            width: size + 'px',
            height: size + 'px',
            border: isSelf ? '3px solid #16a34a' : '2.5px solid transparent',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }" @click.stop="$emit('node-click', member)">
          <!-- <img :src="avatarSrc" :alt="avatarAlt" class="w-full h-full object-cover" @error="onAvatarError" /> -->
          <img :src="avatarSrc" :alt="avatarAlt" class="object-cover" @error="onAvatarError" />
        </div>

        <!-- Deceased overlay -->
        <div v-if="isDeceased" class="absolute inset-0 rounded-full z-20 pointer-events-none"
          style="background: rgba(0,0,0,0.25)" />
      </div>
    </div>

    <div class="bg-white/80 w-full flex flex-col justify-center items-center space-y-2">
      <!-- Name (sidebar: Display → Show Names) -->
      <p v-if="showNames" class="text-center font-semibold text-neutral-900 leading-tight"
        :style="{ fontSize: nameFontSize + 'px', maxWidth: size * 1.4 + 'px' }">
        {{ displayName }}
      </p>

      <!-- Relation type (Tree Settings → Show Relationship Title) -->
      <p v-if="showRelationshipTitle && roleLabel" class="text-center text-neutral-500 leading-none"
        :style="{ fontSize: roleFontSize + 'px' }">
        {{ roleLabel }}
      </p>

      <!-- Add button -->
      <button v-if="showAdd"
        class="flex items-center justify-center rounded-full bg-white border border-neutral-200 shadow-sm hover:bg-primary-50 hover:border-primary-400 transition-colors z-10"
        :style="{ width: addBtnSize + 'px', height: addBtnSize + 'px' }"
        :title="`Add relative to ${addButtonContextName}`" @click.stop="$emit('add', member)">
        <svg :width="addBtnSize * 0.45" :height="addBtnSize * 0.45" viewBox="0 0 14 14" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M7 1V13M1 7H13" stroke="#16a34a" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { getUserAvatar } from '@/helpers/general.helpers'
import maleMemberSvg from '@/assets/svg/member/male.svg?url'
import femaleMemberSvg from '@/assets/svg/member/female.svg?url'
import nodeBlobUrl from '@/assets/images/node-blob.png?url'

/** Must match `transform: scale(...)` on the blob layer (used to reserve bleed so parents don’t clip). */
const BLOB_RING_SCALE = 1.35

const props = withDefaults(
  defineProps<{
    member: FamilyMemberInterface & { is_deceased?: boolean | null }
    /** Whether this node represents the logged-in user */
    isSelf?: boolean
    /** Display size of the avatar circle in px */
    size?: number
    /** Show the + add button */
    showAdd?: boolean
    /** Temporarily highlights this node (e.g. after "View in Tree") */
    highlighted?: boolean
    /** Sidebar Display → Show Photos: profile → gender → initials; off → gender → initials */
    showPhotos?: boolean
    /** Sidebar Display → Show Names (off = blank label) */
    showNames?: boolean
    /** Tree Settings → Show Full Name (first+family vs first only; only when showNames) */
    showFullName?: boolean
    /** Tree Settings → Show Relationship Title (relation_type under the name) */
    showRelationshipTitle?: boolean
  }>(),
  {
    isSelf: false,
    size: 60,
    showAdd: true,
    highlighted: false,
    showPhotos: true,
    showNames: true,
    showFullName: true,
    showRelationshipTitle: true,
  },
)

defineEmits<{
  /** Fired when the avatar is clicked — opens member profile modal */
  (e: 'node-click', member: FamilyMemberInterface): void
  /** Fired when the + button is clicked; passes the member back */
  (e: 'add', member: FamilyMemberInterface): void
}>()

// ── Avatar ────────────────────────────────────────────────────────────────────
// showPhotos on: profile URL → male/female SVG → initials. Off: male/female SVG → initials.

const profilePictureFailed = ref(false)
const genderPlaceholderFailed = ref(false)

watch(
  () => props.member.id,
  () => {
    profilePictureFailed.value = false
    genderPlaceholderFailed.value = false
  },
)

watch(
  () => props.showPhotos,
  () => {
    profilePictureFailed.value = false
    genderPlaceholderFailed.value = false
  },
)

const avatarSrc = computed(() => {
  const m = props.member

  if (props.showPhotos) {
    const profile = m.profile_picture_url
    if (profile != null && String(profile).trim() !== '' && !profilePictureFailed.value) {
      return profile
    }
    if (!genderPlaceholderFailed.value) {
      if (m.gender === 'male') return maleMemberSvg
      if (m.gender === 'female') return femaleMemberSvg
    }
    return getUserAvatar(m.first_name, m.family_name)
  }

  if (!genderPlaceholderFailed.value) {
    if (m.gender === 'male') return maleMemberSvg
    if (m.gender === 'female') return femaleMemberSvg
  }
  return getUserAvatar(m.first_name, m.family_name)
})

const onAvatarError = () => {
  const m = props.member
  if (props.showPhotos) {
    const profile = m.profile_picture_url
    const hasProfile =
      profile != null && String(profile).trim() !== '' && !profilePictureFailed.value
    if (hasProfile) {
      profilePictureFailed.value = true
      return
    }
  }
  const g = m.gender
  if ((g === 'male' || g === 'female') && !genderPlaceholderFailed.value) {
    genderPlaceholderFailed.value = true
  }
}

// ── Labels ───────────────────────────────────────────────────────────────────
// showNames: off → blank. showFullName: full (first + family) vs first name only.

const displayName = computed(() => {
  if (!props.showNames) return ''
  const m = props.member
  const first = (m.first_name || '').trim()
  const family = (m.family_name || '').trim()
  const full = (m.full_name || '').trim()

  if (props.showFullName) {
    if (full) return full
    const combined = [first, family].filter(Boolean).join(' ')
    if (props.isSelf) return combined || first || 'You'
    return combined || first
  }

  if (props.isSelf) return first || 'You'
  return first
})

const addButtonContextName = computed(() => {
  const m = props.member
  const first = (m.first_name || '').trim()
  const family = (m.family_name || '').trim()
  const full = (m.full_name || '').trim()
  if (full) return full
  const combined = [first, family].filter(Boolean).join(' ')
  return combined || first || 'member'
})

const avatarAlt = computed(() => displayName.value || addButtonContextName.value)

const roleLabel = computed(() => {
  if (props.isSelf) return ''
  const rel = props.member.relationship_metadata?.relation_type
  if (!rel) return ''
  return rel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
})

// ── Deceased ─────────────────────────────────────────────────────────────────

const isDeceased = computed(() => !!props.member.is_deceased)

// ── Decorative blob (PNG behind avatar). Scale grows past the avatar box; padding absorbs bleed.

const blobBleedPx = computed(() =>
  Math.ceil((props.size * (BLOB_RING_SCALE - 1)) / 2) + 2,
)

const avatarStackPaddingStyle = computed(() => ({
  padding: `${blobBleedPx.value}px`,
}))

const rootColumnStyle = computed(() => {
  const w = props.size + 2 * blobBleedPx.value
  return {
    width: `${Math.max(w, Math.ceil(props.size * 1.4))}px`,
    minWidth: `${Math.max(w, Math.ceil(props.size * 1.4))}px`,
  }
})

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

// ── Sizing ────────────────────────────────────────────────────────────────────

const nameFontSize = computed(() => Math.round(props.size * 0.175))
const roleFontSize = computed(() => Math.round(props.size * 0.15))
const addBtnSize = computed(() => Math.round(props.size * 0.38))
</script>
