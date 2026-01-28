<template>
  <!-- Variant: modal (for modal dialogs) -->
  <div v-if="variant === 'modal'"
    class="relative w-full bg-white rounded-2xl px-8 py-10 md:px-12 md:py-12 text-center space-y-6">
    <div class="flex flex-col items-center space-y-4 pt-8">
      <!-- Avatar with initials fallback -->
      <div class="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg flex items-center justify-center"
        :class="hasAvatar
          ? 'border-4 border-white'
          : 'bg-gradient-to-br from-purple-500 to-purple-600 border-4 border-white'
          ">
        <img v-if="hasAvatar" :src="avatarSrc" alt="Profile photo" class="w-full h-full object-cover" />
        <span v-else class="text-white text-4xl md:text-5xl font-semibold">
          {{ memberInitials }}
        </span>
      </div>

      <div class="space-y-2">
        <h2 class="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
          {{ displayMember.name }}
        </h2>
        <p class="text-green-600 text-base font-medium">{{ displayMember.relation }}</p>
      </div>
    </div>

    <!-- Individual pill-shaped tags -->
    <div class="flex flex-wrap justify-center gap-2">
      <span v-for="tag in tags" :key="tag"
        class="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 font-medium">
        {{ tag }}
      </span>
    </div>

    <!-- Action buttons -->
    <div class="flex flex-col md:grid grid-cols-3 gap-3 pt-2">
      <MlbButton :label="shareInviteLoading ? 'Generating link...' : 'Invite Member'" :loading="shareInviteLoading"
        :disabled="shareInviteLoading || !canInvite"
        class="w-full! rounded-xl! bg-white! border-primary-200! h-12! text-primary-700! hover:bg-primary-100! font-semibold!"
        @click="handleInviteMember" />
      <MlbButton label="View Family Tree"
        class="col-span-2! w-full! rounded-xl! bg-[#0B5132]! h-12! text-white! hover:bg-[#0a4730]! font-semibold!"
        @click="emitProfile" />
      <!-- <button
        type="button"
        class="w-full h-12 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        @click="emitEdit"
      >
        Edit Info
      </button> -->
    </div>
  </div>

  <!-- Variant: soft card (matches mock) -->
  <section v-else :class="wrapperClass">
    <div v-if="variant === 'card'"
      class="relative max-w-3xl mx-auto bg-white rounded-[28px] shadow-[0_20px_60px_rgba(12,12,13,0.08)] border border-[#F1E5D8] px-8 py-10 md:px-12 md:py-12 text-center space-y-6">
      <div v-if="showBack" class="absolute left-6 top-6">
        <BackButton icon="vuesax.linear.arrow-left" class="text-neutral-700!" @update:go-back="emitBack" />
      </div>

      <div class="flex flex-col items-center space-y-5">
        <!-- Avatar with initials fallback -->
        <div class="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-lg flex items-center justify-center"
          :class="hasAvatar
            ? 'border-4 border-white'
            : 'bg-gradient-to-br from-purple-500 to-purple-600 border-4 border-white'
            ">
          <img v-if="hasAvatar" :src="avatarSrc" alt="Profile photo" class="w-full h-full object-cover" />
          <span v-else class="text-white text-3xl md:text-4xl font-semibold">
            {{ memberInitials }}
          </span>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
            {{ displayMember.name }}
          </h2>
          <p class="text-green-600 text-base font-medium">{{ displayMember.relation }}</p>
        </div>
      </div>

      <!-- Individual pill-shaped tags -->
      <div class="flex flex-wrap justify-center gap-2">
        <span v-for="tag in tags" :key="tag"
          class="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 font-medium">
          {{ tag }}
        </span>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col md:grid grid-cols-3 gap-3 pt-2">
        <MlbButton :label="shareInviteLoading ? 'Generating link...' : 'Invite Member'" :loading="shareInviteLoading"
          :disabled="shareInviteLoading || !canInvite"
          class="w-full! rounded-xl! bg-white! border-primary-200! h-12! text-primary-700! hover:bg-primary-100! font-semibold!"
          @click="handleInviteMember" />
        <MlbButton label="View Family Tree"
          class="col-span-2! w-full! rounded-xl! bg-[#0B5132]! h-12! text-white! hover:bg-[#0a4730]! font-semibold!"
          @click="emitProfile" />
        <!-- <button
          type="button"
          class="w-full h-12 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          @click="emitEdit"
        >
          Edit Info
        </button> -->
      </div>
    </div>

    <!-- Variant: compact sheet (for drawers/modals) -->
    <div v-else
      class="max-w-3xl mx-auto bg-white/80 backdrop-blur rounded-2xl border border-[#E5D9C9] px-6 py-7 text-center space-y-5 shadow-sm">
      <div class="flex flex-col items-center space-y-3">
        <!-- Avatar with initials fallback -->
        <div class="w-24 h-24 rounded-full overflow-hidden shadow-md flex items-center justify-center" :class="hasAvatar
          ? 'border-4 border-white'
          : 'bg-gradient-to-br from-purple-500 to-purple-600 border-4 border-white'
          ">
          <img v-if="hasAvatar" :src="avatarSrc" alt="Profile photo" class="w-full h-full object-cover" />
          <span v-else class="text-white text-xl font-semibold">
            {{ memberInitials }}
          </span>
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-semibold text-neutral-900 leading-tight">
            {{ displayMember.name }}
          </h2>
          <p class="text-green-600 text-sm font-medium">{{ displayMember.relation }}</p>
        </div>
      </div>

      <!-- Individual pill-shaped tags -->
      <div class="flex flex-wrap justify-center gap-2">
        <span v-for="tag in tags" :key="tag"
          class="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 font-medium">
          {{ tag }}
        </span>
      </div>

      <div class="flex flex-col md:grid grid-cols-3 gap-3 pt-2">
        <MlbButton :label="shareInviteLoading ? 'Generating link...' : 'Invite Member'" :loading="shareInviteLoading"
          :disabled="shareInviteLoading || !canInvite"
          class="w-full! rounded-xl! bg-white! border-primary-200! h-12! text-primary-700! hover:bg-primary-100! font-semibold!"
          @click="handleInviteMember" />
        <MlbButton label="View Family Tree"
          class="col-span-2! w-full rounded-xl! bg-[#0B5132]! h-12! text-white! hover:bg-[#0a4730]! font-semibold!"
          @click="emitProfile" />
        <!-- <button
          type="button"
          class="w-full h-12 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          @click="emitEdit"
        >
          Edit Info
        </button> -->
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMessage } from 'naive-ui'
import MlbButton from '@/components/ui/MlbButton.vue'
import BackButton from '@/components/common/BackButton.vue'
import { getUserAvatar } from '@/helpers/general.helpers'
import { useFamilyTree } from '@/composables/family-tree.composables'
import type { NodeMemberInterface } from '@/types/family-tree.types'
import { useRegistrationLinkMutation } from '@/services/authentication.services'
import { useShareComposable } from '@/composables/useShare'
import { handleApiError } from '@/helpers/error.helpers'

const props = withDefaults(
  defineProps<{
    member?: NodeMemberInterface
    variant?: 'card' | 'compact' | 'modal'
    showBack?: boolean
  }>(),
  {
    variant: 'card',
    showBack: true,
    member: () => ({
      name: 'Tope Hunt',
      relation: 'You',
      profileUrl: '',
      generation: '3rd Generation',
      family_name: "Tunde's Family",
      childrenCount: '6 Children',
      profile_picture_url:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    }),
  },
)

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'view-profile'): void
  (e: 'edit'): void
}>()

const { computedChildrenCount } = useFamilyTree()

const displayMember = computed(() => {
  const base = props.member || {}
  const childrenCount = computedChildrenCount(base)
  const fullName = base.full_name || [base.first_name, base.family_name].filter(Boolean).join(' ')
  return {
    name: fullName || 'Unknown member',
    relation: base.relation || (base.isSelf ? 'You' : 'Family member'),
    profileUrl: base.profileUrl || '',
    description:
      base.description ||
      'Brief description on the user, or any other thing we feel we should add here, but that would all depend on what the user is inputing on the onboarding mode',
    generation: base.generation || '3rd Generation',
    familyName: base.family_name ? `${base.family_name}'s Family` : null,
    childrenCount:
      Number(childrenCount) > 1 ? `${childrenCount} Children` : `${childrenCount} Child`,
    avatar: base.profile_picture_url || base.avatar || null,
    first_name: base.first_name,
    last_name: base.family_name,
  }
})

// Get initials from name
const memberInitials = computed(() => {
  const name = displayMember.value.name || ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0]![0] || '') + (parts[parts.length - 1]![0] || '')
  } else if (parts.length === 1) {
    return parts[0]!.substring(0, 2).toUpperCase()
  }
  return 'F'
})

// Check if avatar exists
const hasAvatar = computed(() => {
  return !!(displayMember.value.avatar && displayMember.value.avatar !== '')
})

const tags = computed(() => {
  const t: string[] = []
  if (displayMember.value.generation) t.push(displayMember.value.generation)
  if (displayMember.value.familyName) t.push(displayMember.value.familyName)
  if (
    displayMember.value.childrenCount !== undefined &&
    displayMember.value.childrenCount !== null
  ) {
    t.push(String(displayMember.value.childrenCount))
  }
  return t
})

const avatarSrc = computed(() => {
  const d = displayMember.value
  return d.avatar || getUserAvatar(d.first_name || 'User', d.last_name || '', d.avatar || undefined)
})

const wrapperClass = computed(() => {
  if (props.variant === 'modal') {
    return '' // No wrapper styling for modal - parent handles it
  }
  return props.variant === 'card'
    ? 'bg-[#F5F1E8] px-4 py-6 md:px-8 md:py-10 rounded-[32px]'
    : 'bg-[#F5F1E8] px-3 py-4 md:px-6 md:py-8 rounded-[24px]'
})

const emitBack = () => emit('back')
const emitProfile = () => emit('view-profile')
const emitEdit = () => emit('edit')

const variant = computed(() => props.variant)

// Share invite functionality
const message = useMessage()
const registrationLinkMutation = useRegistrationLinkMutation()
const { shareLink } = useShareComposable()
const shareInviteLoading = computed(() => registrationLinkMutation.isPending.value)

// Check if member can be invited (has ID)
const canInvite = computed(() => {
  return !!props.member?.id
})

const handleInviteMember = async () => {
  const familyMemberId = props.member?.id

  if (!familyMemberId) {
    message.error('Unable to invite member: Member ID not found')
    return
  }

  try {
    // Generate registration link
    const linkResponse = await registrationLinkMutation.mutateAsync({
      family_member_id: familyMemberId,
    })

    const registrationLink = linkResponse.data.registration_link

    // Extract query parameters from the registration link
    const url = new URL(registrationLink)
    const queryParams = url.search

    // Get VITE_APP_URL from environment and append query parameters
    const appUrl = (import.meta.env.VITE_APP_URL || '') + 'onboarding/signup'
    const finalUrl = queryParams ? `${appUrl}${queryParams}` : appUrl

    // Share the link
    const shareResult = await shareLink({
      title: 'Join our family tree on Molebi App',
      text: 'I invite you to join our family tree on Molebi App',
      url: finalUrl,
    })

    if (shareResult.success) {
      message.success(
        shareResult.method === 'clipboard'
          ? 'Registration link copied to clipboard'
          : 'Link shared successfully',
      )
    }
  } catch (error) {
    handleApiError(error, message)
  }
}
</script>

<style scoped>
:deep(.n-button) {
  padding: 0 !important;
  margin: 0 !important;
}

/* Ensure button spacing works */
.flex.flex-col.gap-3>* {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
