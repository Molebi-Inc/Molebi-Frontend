<template>
  <section :class="wrapperClass">
    <!-- Variant: soft card (matches mock) -->
    <div
      v-if="variant === 'card'"
      class="relative max-w-3xl mx-auto bg-white rounded-[28px] shadow-[0_20px_60px_rgba(12,12,13,0.08)] border border-[#F1E5D8] px-8 py-10 md:px-12 md:py-12 text-center space-y-6"
    >
      <div v-if="showBack" class="absolute left-6 top-6">
        <BackButton
          icon="vuesax.linear.arrow-left"
          class="text-neutral-700!"
          @update:go-back="emitBack"
        />
      </div>

      <div class="flex flex-col items-center space-y-4">
        <div
          class="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
        >
          <img :src="avatarSrc" alt="Profile photo" class="w-full h-full object-cover" />
        </div>

        <div class="space-y-1">
          <h2 class="text-2xl md:text-3xl font-semibold text-neutral-900 leading-tight">
            {{ displayMember.name }}
          </h2>
          <p class="text-neutral-500 text-base">{{ displayMember.relation }}</p>
          <!-- <RouterLink
            v-if="displayMember.profileUrl"
            :to="displayMember.profileUrl"
            class="text-primary-700 font-medium underline underline-offset-4"
            @click.prevent="emitProfile"
          >
            Go to profile
          </RouterLink>
          <button
            v-else
            type="button"
            class="text-primary-700 font-medium underline underline-offset-4"
            @click="emitProfile"
          >
            Go to profile
          </button> -->
        </div>
      </div>

      <div
        class="bg-[#F5F1E8] rounded-full px-4 py-3 md:px-6 md:py-4 inline-flex items-center gap-3 text-sm text-[#0B5132] font-medium"
      >
        <span v-for="(tag, index) in tags" :key="tag" class="flex items-center gap-3">
          <span>{{ tag }}</span>
          <span v-if="index !== tags.length - 1" class="w-px h-4 bg-[#D6D4CE] block" />
        </span>
      </div>

      <div>
        <MlbButton
          label="View Family Tree"
          class="w-full! rounded-xl! bg-primary-700! h-12! text-white! hover:bg-primary-700!"
          @click="emitProfile"
        />
      </div>
    </div>

    <!-- Variant: compact sheet (for drawers/modals) -->
    <div
      v-else
      class="max-w-3xl mx-auto bg-white/80 backdrop-blur rounded-2xl border border-[#E5D9C9] px-6 py-7 text-center space-y-5 shadow-sm"
    >
      <!-- <div class="flex items-center justify-between">
        <BackButton
          v-if="showBack"
          icon="vuesax.linear.arrow-left"
          class="text-neutral-700!"
          @update:go-back="emitBack"
        />
        <div class="flex-1"></div>
        <RouterLink
          v-if="displayMember.profileUrl"
          :to="displayMember.profileUrl"
          class="text-primary-700 text-sm font-medium underline underline-offset-4"
          @click.prevent="emitProfile"
        >
          Go to profile
        </RouterLink>
        <button
          v-else
          type="button"
          class="text-primary-700 text-sm font-medium underline underline-offset-4"
          @click="emitProfile"
        >
          Go to profile
        </button>
      </div> -->

      <div class="flex flex-col items-center space-y-3">
        <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
          <img :src="avatarSrc" alt="Profile photo" class="w-full h-full object-cover" />
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-semibold text-neutral-900 leading-tight">
            {{ displayMember.name }}
          </h2>
          <p class="text-neutral-500 text-sm">{{ displayMember.relation }}</p>
        </div>
      </div>

      <div
        class="bg-[#F7F2EA] rounded-full px-4 py-3 flex flex-wrap justify-center gap-3 text-sm text-[#0B5132] font-medium"
      >
        <span
          v-for="(tag, index) in tags"
          :key="tag + index"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#E5D9C9]"
        >
          {{ tag }}
        </span>
      </div>

      <div>
        <MlbButton
          label="View Family Tree"
          class="w-full rounded-xl! bg-primary-700! h-12! text-white! hover:bg-primary-700!"
          @click="emitProfile"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import BackButton from '@/components/common/BackButton.vue'
import { getUserAvatar } from '@/helpers/general.helpers'

type Member = {
  name?: string
  first_name?: string
  last_name?: string
  full_name?: string
  avatar?: string | null
  profile_picture_url?: string | null
  generation?: string
  family_name?: string
  childrenCount?: number | string
  relation?: string
  profileUrl?: string
  isSelf?: boolean
  description?: string
}

const props = withDefaults(
  defineProps<{
    member?: Member
    variant?: 'card' | 'compact'
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
}>()

const displayMember = computed(() => {
  const base = props.member || {}
  const fullName =
    base.full_name || base.name || [base.first_name, base.last_name].filter(Boolean).join(' ')
  return {
    name: fullName || 'Unknown member',
    relation: base.relation || (base.isSelf ? 'You' : 'Family member'),
    profileUrl: base.profileUrl || '',
    description:
      base.description ||
      'Brief description on the user, or any other thing we feel we should add here, but that would all depend on what the user is inputing on the onboarding mode',
    generation: base.generation || '3rd Generation',
    familyName: base.family_name + "' Family'" || "Tunde's Family",
    childrenCount:
      base.childrenCount !== undefined && base.childrenCount !== null
        ? `${base.childrenCount} ${Number(base.childrenCount) === 1 ? 'Child' : 'Children'}`
        : 'Children',
    avatar: base.profile_picture_url || base.avatar || null,
    first_name: base.first_name,
    last_name: base.last_name,
  }
})

const tags = computed(() => {
  const t: string[] = []
  if (displayMember.value.generation) t.push(displayMember.value.generation)
  if (displayMember.value.familyName) t.push(displayMember.value.familyName)
  if (displayMember.value.childrenCount) t.push(String(displayMember.value.childrenCount))
  return t
})

const avatarSrc = computed(() => {
  const d = displayMember.value
  return d.avatar || getUserAvatar(d.first_name || 'User', d.last_name || '', d.avatar || undefined)
})

const wrapperClass = computed(() =>
  props.variant === 'card'
    ? 'bg-[#F5F1E8] px-4 py-6 md:px-8 md:py-10 rounded-[32px]'
    : 'bg-[#F5F1E8] px-3 py-4 md:px-6 md:py-8 rounded-[24px]',
)

const emitBack = () => emit('back')
const emitProfile = () => emit('view-profile')

const variant = computed(() => props.variant)
</script>

<style scoped>
:deep(.n-button) {
  padding: 0 !important;
}
</style>
