<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="flex items-center px-5 py-4 border-b border-neutral-100 shrink-0">
      <button
        class="mr-3 p-1 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        @click="$emit('back')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd"
            d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
            clip-rule="evenodd" />
        </svg>
      </button>
      <h2 class="text-base font-semibold text-neutral-900 flex-1 text-center pr-8">
        Add {{ memberType.label }} to {{ formTargetName }}
      </h2>
    </div>

    <!-- Scrollable form body -->
    <div class="flex-1 overflow-y-auto px-5 py-5 space-y-5">
      <!-- Profile photo -->
      <div class="flex justify-center">
        <label class="relative cursor-pointer group">
          <div
            class="w-20 h-20 rounded-full border-2 border-dashed border-neutral-300 group-hover:border-primary-400 flex items-center justify-center overflow-hidden transition-colors bg-neutral-50">
            <img v-if="photoPreview" :src="photoPreview" alt="Profile photo" class="w-full h-full object-cover" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              class="w-10 h-10 text-neutral-300">
              <path fill-rule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <!-- Camera badge -->
          <div
            class="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border border-neutral-200 flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              class="w-3.5 h-3.5 text-neutral-600">
              <path fill-rule="evenodd"
                d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <input type="file" accept="image/*" class="sr-only" @change="handlePhotoChange" />
        </label>
      </div>

      <!-- First & Middle Name -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">First &amp; Middle Name</label>
        <input v-model="form.first_name" type="text" placeholder="Enter first name"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
      </div>

      <!-- Partner: Maiden name + Married name instead of Last Name -->
      <template v-if="isPartner">
        <div v-if="!isPaternalGrandfatherForm">
          <label class="block text-sm font-medium text-neutral-600 mb-2">Maiden Name</label>
          <input v-model="form.maiden_name" type="text" placeholder="Enter maiden name"
            class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-600 mb-2">Married Name</label>
          <input v-model="form.married_name" type="text" placeholder="Enter married name"
            class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
        </div>
      </template>

      <!-- All others: Last Name -->
      <div v-else>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Last Name</label>
        <input v-model="form.family_name" type="text" placeholder="Enter last name"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
      </div>

      <!-- after-last-name slot (hidden when contextOverride pre-determines the relationship) -->
      <component :is="extraFieldsComponent"
        v-if="memberType.extraFieldsSlot === 'after-last-name' && extraFieldsComponent && !contextOverride"
        v-model="form" />

      <!-- Date of Birth -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Date of Birth</label>
        <input :value="form.date_of_birth ?? ''" type="date" placeholder="DD MM YYYY"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors"
          @input="form.date_of_birth = ($event.target as HTMLInputElement).value || null" />
        <p class="mt-1.5 text-xs text-neutral-400 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 shrink-0">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
              clip-rule="evenodd" />
          </svg>
          You can leave it blank if you're unsure or add just year
        </p>
      </div>

      <!-- after-dob slot -->
      <component :is="extraFieldsComponent"
        v-if="memberType.extraFieldsSlot === 'after-dob' && extraFieldsComponent && !contextOverride" v-model="form" />

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-3">Status</label>
        <div class="flex gap-3">
          <label v-for="opt in statusOptions" :key="opt.value.toString()"
            class="flex items-center gap-2 px-5 py-3 rounded-2xl border cursor-pointer transition-colors" :class="form.is_deceased === opt.value
              ? 'border-primary-400 bg-primary-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
              " @click="form.is_deceased = opt.value">
            <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="form.is_deceased === opt.value ? 'border-primary-600' : 'border-neutral-300'">
              <span v-if="form.is_deceased === opt.value" class="w-2 h-2 rounded-full bg-primary-600" />
            </span>
            <span class="text-sm font-medium"
              :class="form.is_deceased === opt.value ? 'text-neutral-900' : 'text-neutral-600'">
              {{ opt.label }}
            </span>
          </label>
        </div>
      </div>

      <!-- after-status slot -->
      <component :is="extraFieldsComponent"
        v-if="memberType.extraFieldsSlot === 'after-status' && extraFieldsComponent && !contextOverride"
        v-model="form" />

      <!-- Email Address -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Email Address</label>
        <input v-model="form.email" type="email" placeholder="Enter invitation email" :disabled="form.is_deceased"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
      </div>

      <!-- Invite checkbox -->
      <label class="flex items-center gap-3 cursor-pointer">
        <span class="w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors" :class="[
          form.send_invite ? 'bg-primary-600 border-primary-600' : 'border-neutral-300',
          canToggleInvite ? '' : 'opacity-50 cursor-not-allowed',
        ]" @click="toggleInvite">
          <svg v-if="form.send_invite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white"
            class="w-3 h-3">
            <path fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clip-rule="evenodd" />
          </svg>
        </span>
        <span class="text-sm" :class="canToggleInvite ? 'text-neutral-700' : 'text-neutral-400'">
          Invite to join family tree
        </span>
      </label>
    </div>

    <!-- Submit button -->
    <div class="px-5 py-4 border-t border-neutral-100 shrink-0">
      <button
        class="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold text-sm py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
        :disabled="isSubmitting || !isFormValid" @click="handleSubmit">
        <svg v-if="isSubmitting" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          class="w-4 h-4 animate-spin">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
        </svg>
        {{ isSubmitting ? 'Adding...' : 'Add Relative' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useProfileStore } from '@/stores/profile.store'
import { useAddFamilyMemberMutation, useCreateTimelineMutation } from '@/services/family-tree.service'
import { handleApiError } from '@/helpers/error.helpers'
import type { FamilyMemberFormValues } from '@/types/family-tree.types'
import type { ExtraFieldsVariant, MemberTypeConfig, V2MemberFormData } from './member-type.config'
import { defaultFormData } from './member-type.config'
import SiblingExtraFields from './fields/SiblingExtraFields.vue'
import PartnerExtraFields from './fields/PartnerExtraFields.vue'
import ChildExtraFields from './fields/ChildExtraFields.vue'
import StepSiblingExtraFields from './fields/StepSiblingExtraFields.vue'
import type { Component } from 'vue'

/**
 * Maps an ExtraFieldsVariant to its component.
 * To add a new section: create the component, import it above, add it here.
 */
const EXTRA_FIELDS_COMPONENTS: Record<NonNullable<ExtraFieldsVariant>, Component> = {
  sibling: SiblingExtraFields,
  partner: PartnerExtraFields,
  child: ChildExtraFields,
  'step-sibling': StepSiblingExtraFields,
}

interface Props {
  memberType: MemberTypeConfig
  /** When set, overrides the derived relation_type + related_through and hides extra fields. */
  contextOverride?: { relation_type: string; related_through: number | null } | null
  /** The member we're adding a relative to (shown in the form header). */
  contextMember?: import('@/types/family-tree.types').FamilyMemberInterface | null
}

interface CreatedMember {
  id: number
  name: string
  gender: string
  relationKey: string
  isDeceased: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'back'): void
  (e: 'success', member: CreatedMember): void
}>()

const message = useMessage()
const profileStore = useProfileStore()
const addMemberMutation = useAddFamilyMemberMutation()
const createdMemberIdForTimeline = ref<number | null>(null)
const createTimelineMutation = useCreateTimelineMutation(
  computed(() => createdMemberIdForTimeline.value ?? 0),
)

const isSubmitting = computed(() => addMemberMutation.isPending.value)

const form = ref<V2MemberFormData>(defaultFormData())
const photoPreview = ref<string | null>(null)

const userFirstName = computed(
  () => profileStore.userDetails?.first_name || 'you',
)

/** Name shown in the form header: context member's first name, or self's first name. */
const formTargetName = computed(() => {
  if (props.contextMember) {
    const m = props.contextMember
    return (m.first_name || m.full_name || '').trim() || 'them'
  }
  return userFirstName.value
})

const isPartner = computed(() => props.memberType.extraFields === 'partner')
const isPaternalGrandfatherForm = computed(
  () => props.contextOverride?.relation_type === 'paternal_grandfather',
)

/** Resolves the correct component for the current member type's extra fields. */
const extraFieldsComponent = computed(() =>
  props.memberType.extraFields ? EXTRA_FIELDS_COMPONENTS[props.memberType.extraFields] : null,
)

const statusOptions = [
  { label: 'Living', value: false },
  { label: 'Deceased', value: true },
]

// Reset form whenever member type changes
watch(
  () => props.memberType.key,
  () => {
    form.value = {
      ...defaultFormData(),
      gender: props.memberType.defaultGender ?? 'male',
    }
    photoPreview.value = null
  },
  { immediate: true },
)

const handlePhotoChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  form.value.profile_picture = file
  if (file) {
    photoPreview.value = URL.createObjectURL(file)
  } else {
    photoPreview.value = null
  }
}

const isFormValid = computed(() => Boolean(form.value.first_name.trim()))
const canToggleInvite = computed(() => Boolean(form.value.email?.trim()) && !Boolean(form.value.is_deceased))
const RELATED_THROUGH_PARENT_RELATION_TYPES = new Set([
  'niece',
  'nephew',
  'cousin',
  'step_sibling',
  'half_sibling',
])

const getUploadFile = (value: unknown): File | null => {
  if (value instanceof File) return value
  if (value instanceof Blob) return new File([value], 'profile-picture')
  return null
}

const toggleInvite = () => {
  if (!canToggleInvite.value) return
  form.value.send_invite = !form.value.send_invite
}

watch(
  () => form.value.email,
  (email) => {
    if (!email?.trim() && form.value.send_invite) {
      form.value.send_invite = false
    }
  },
)

/** Map V2MemberFormData → FamilyMemberFormValues for the API */
const buildApiPayload = (): FamilyMemberFormValues => {
  const f = form.value
  const type = props.memberType

  // Resolve family_name (last name)
  const family_name = isPartner.value
    ? f.married_name || f.maiden_name || ''
    : f.family_name

  // Resolve gender
  const gender =
    type.defaultGender ??
    (isPartner.value ? (f.gender as 'male' | 'female') : 'prefer_not_to_say')

  const resolveParentId = (relationType: string, relatedThrough: number | null) =>
    RELATED_THROUGH_PARENT_RELATION_TYPES.has(relationType) ? relatedThrough : f.parent_id

  // When a context override is provided, use it directly — no need to derive from extra fields.
  if (props.contextOverride) {
    const parent_id = resolveParentId(
      props.contextOverride.relation_type,
      props.contextOverride.related_through,
    )
    return {
      first_name: f.first_name.trim(),
      middle_name: f.middle_name.trim(),
      family_name,
      is_same_family_name: f.is_same_family_name,
      nickname: f.maiden_name || '',
      relation_type: props.contextOverride.relation_type,
      profile_picture: f.profile_picture,
      gender,
      related_through: props.contextOverride.related_through,
      parent_id,
      is_adoptive: f.is_adoptive,
      is_former: f.is_former,
      is_deceased: f.is_deceased,
      date_of_birth: f.date_of_birth,
    }
  }

  // Default (self) flow: derive relation_type and related_through from form + config.
  const relationTypeMap: Record<string, string> = {
    mother: 'mother',
    father: 'father',
    brother: 'sibling',
    sister: 'sibling',
    spouse: 'spouse',
    children: 'child',
    'step-sibling': 'step_sibling',
  }
  const relation_type = relationTypeMap[type.relationConfigKey] ?? type.relationConfigKey

  let related_through: number | null = null
  if (type.extraFields === 'sibling') {
    if (
      (f.shared_parents === 'father_only' || f.shared_parents === 'mother_only') &&
      f.sibling_parent_id
    ) {
      related_through = f.sibling_parent_id
    }
  } else if (type.extraFields === 'step-sibling') {
    if (f.sibling_parent_id) {
      related_through = f.sibling_parent_id
    }
  } else if (type.extraFields === 'child') {
    if (typeof f.second_parent_id === 'number') {
      related_through = f.second_parent_id
    }
  }

  const parent_id = resolveParentId(relation_type, related_through)

  return {
    first_name: f.first_name.trim(),
    middle_name: f.middle_name.trim(),
    family_name,
    is_same_family_name: f.is_same_family_name,
    nickname: f.maiden_name || '',
    relation_type,
    profile_picture: f.profile_picture,
    gender,
    related_through,
    parent_id,
    is_adoptive: f.is_adoptive,
    is_former: f.is_former,
    is_deceased: f.is_deceased,
    date_of_birth: f.date_of_birth,
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    const payload = buildApiPayload()
    const uploadFile = getUploadFile(payload.profile_picture)

    // Use FormData only when we have an actual binary file.
    let apiData: FamilyMemberFormValues | FormData
    if (uploadFile) {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          if (k === 'profile_picture') return
          if (typeof v === 'boolean') {
            fd.append(k, v ? '1' : '0')
            return
          }
          fd.append(k, String(v))
        }
      })
      fd.append('profile_picture', uploadFile)
      apiData = fd
    } else {
      const { profile_picture, ...rest } = payload
      void profile_picture
      apiData = rest as FamilyMemberFormValues
    }

    const response = await addMemberMutation.mutateAsync(apiData)

    const createdId = (response.data as any)?.id ?? null

    if (createdId && form.value.date_of_birth) {
      try {
        createdMemberIdForTimeline.value = createdId
        await createTimelineMutation.mutateAsync({
          type: 'birth',
          title: 'Birth',
          description: null,
          place: null,
          event_date: form.value.date_of_birth,
        })
      } catch {
        // Do not block member creation success when timeline creation fails.
      }
    }

    const fullName =
      `${form.value.first_name} ${isPartner.value ? form.value.married_name : form.value.family_name}`.trim()

    emit('success', {
      id: createdId,
      name: fullName,
      gender: form.value.gender,
      relationKey: props.memberType.relationConfigKey,
      isDeceased: form.value.is_deceased,
    })
  } catch (error) {
    handleApiError(error, message)
  }
}
</script>
