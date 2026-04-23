<template>
  <MlbModal :show="show" :max-width="480" :bottom-sheet="isMobile" :bottom-sheet-height="680" class="rounded-3xl!"
    @update:show="$emit('update:show', false)">
    <template #header>
      <div class="flex items-center justify-between">
        <button
          class="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors"
          @click="$emit('update:show', false)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
        <h3 class="text-base font-semibold text-neutral-900">Edit Member</h3>
        <div class="w-7 h-7" />
      </div>
    </template>

    <!-- Scrollable form body -->
    <div class="space-y-5 pb-2">
      <!-- Profile photo -->
      <div class="flex justify-center">
        <label class="relative cursor-pointer group">
          <div
            class="w-20 h-20 rounded-full border-2 border-dashed border-neutral-300 group-hover:border-primary-400 flex items-center justify-center overflow-hidden transition-colors bg-neutral-50">
            <img v-if="photoPreview || currentPhotoUrl" :src="photoPreview ?? currentPhotoUrl ?? ''" alt="Profile photo"
              class="w-full h-full object-cover" />
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

      <!-- First Name -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">First Name</label>
        <input v-model="form.first_name" type="text" placeholder="Enter first name"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
      </div>

      <!-- Middle Name -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Middle Name</label>
        <input v-model="form.middle_name" type="text" placeholder="Enter middle name"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
      </div>

      <!-- Last Name -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Last Name</label>
        <input v-model="form.family_name" type="text" placeholder="Enter last name"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
      </div>

      <!-- Nickname -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Nickname</label>
        <input v-model="form.nickname" type="text" placeholder="Enter nickname (optional)"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
      </div>

      <!-- Gender -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-3">Gender</label>
        <div class="flex gap-3 flex-wrap">
          <label v-for="opt in genderOptions" :key="opt.value"
            class="flex items-center gap-2 px-4 py-3 rounded-2xl border cursor-pointer transition-colors"
            :class="form.gender === opt.value ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300'"
            @click="form.gender = opt.value">
            <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="form.gender === opt.value ? 'border-primary-600' : 'border-neutral-300'">
              <span v-if="form.gender === opt.value" class="w-2 h-2 rounded-full bg-primary-600" />
            </span>
            <span class="text-sm font-medium"
              :class="form.gender === opt.value ? 'text-neutral-900' : 'text-neutral-600'">
              {{ opt.label }}
            </span>
          </label>
        </div>
      </div>

      <!-- Date of Birth -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Date of Birth</label>
        <input :value="form.date_of_birth ?? ''" type="date"
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

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-3">Status</label>
        <div class="flex gap-3">
          <label v-for="opt in statusOptions" :key="String(opt.value)"
            class="flex items-center gap-2 px-5 py-3 rounded-2xl border cursor-pointer transition-colors"
            :class="form.is_deceased === opt.value ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300'"
            @click="form.is_deceased = opt.value">
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

      <!-- Relation Type -->
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Relation Type</label>
        <select v-model="form.relation_type"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors">
          <option v-for="opt in relationTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="pt-2 flex justify-center">
        <button
          class="w-100 px-6 h-11 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :disabled="isSaving" @click="save">
          <svg v-if="isSaving" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            class="w-4 h-4 animate-spin">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
          </svg>
          <span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
        </button>
      </div>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import type { FamilyMemberInterface, RelationType, GenderType } from '@/types/family-tree.types'
import { useUpdateFamilyMemberMutation } from '@/services/family-tree.service'

type EditableMember = FamilyMemberInterface & {
  is_deceased?: boolean | null
  date_of_birth?: string | null
  biography?: string | null
}

interface EditForm {
  first_name: string
  middle_name: string
  family_name: string
  nickname: string
  gender: GenderType
  date_of_birth: string | null
  is_deceased: boolean
  relation_type: RelationType | ''
}

const props = defineProps<{
  show: boolean
  member: EditableMember
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
  (e: 'saved', member: EditableMember): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const message = useMessage()
const updateMutation = useUpdateFamilyMemberMutation()

const isSaving = ref(false)
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const currentPhotoUrl = ref<string | null>(null)

const form = ref<EditForm>({
  first_name: '',
  middle_name: '',
  family_name: '',
  nickname: '',
  gender: 'prefer_not_to_say',
  date_of_birth: null,
  is_deceased: false,
  relation_type: '',
})

// Pre-fill when modal opens or member changes
watch(
  () => [props.show, props.member] as const,
  ([show]) => {
    if (!show) return
    const m = props.member
    form.value = {
      first_name: m.first_name ?? '',
      middle_name: m.middle_name ?? '',
      family_name: m.family_name ?? '',
      nickname: m.nickname ?? '',
      gender: m.gender ?? 'prefer_not_to_say',
      date_of_birth: (m as any).date_of_birth ?? null,
      is_deceased: !!(m as any).is_deceased,
      relation_type: (m.relationship_metadata?.relation_type as RelationType) ?? '',
    }
    currentPhotoUrl.value = m.profile_picture_url ?? null
    photoFile.value = null
    photoPreview.value = null
  },
  { immediate: true },
)

const genderOptions: Array<{ label: string; value: GenderType }> = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const statusOptions = [
  { label: 'Living', value: false },
  { label: 'Deceased', value: true },
]

const relationTypeOptions: Array<{ label: string; value: RelationType | '' }> = [
  { label: '— Select relation —', value: '' },
  { label: 'Father', value: 'father' },
  { label: 'Mother', value: 'mother' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Half Sibling', value: 'half_sibling' },
  { label: 'Step Sibling', value: 'step_sibling' },
  { label: 'Spouse', value: 'spouse' },
  { label: 'Child', value: 'child' },
  { label: 'Stepfather', value: 'stepfather' },
  { label: 'Stepmother', value: 'stepmother' },
  { label: 'Aunt', value: 'aunt' },
  { label: 'Uncle', value: 'uncle' },
  { label: 'Cousin', value: 'cousin' },
  { label: 'Niece', value: 'niece' },
  { label: 'Nephew', value: 'nephew' },
  { label: 'Grandmother', value: 'grandmother' },
  { label: 'Grandfather', value: 'grandfather' },
  { label: 'Maternal Grandmother', value: 'maternal_grandmother' },
  { label: 'Maternal Grandfather', value: 'maternal_grandfather' },
  { label: 'Paternal Grandmother', value: 'paternal_grandmother' },
  { label: 'Paternal Grandfather', value: 'paternal_grandfather' },
  { label: 'Grandchildren', value: 'grandchildren' },
  { label: 'Father-in-Law', value: 'father_in_law' },
  { label: 'Mother-in-Law', value: 'mother_in_law' },
  { label: 'Brother-in-Law', value: 'brother_in_law' },
  { label: 'Sister-in-Law', value: 'sister_in_law' },
]

const handlePhotoChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  photoFile.value = file
  photoPreview.value = file ? URL.createObjectURL(file) : null
}

const save = async () => {
  if (!props.member.id) return
  isSaving.value = true
  try {
    const data = {
      first_name: form.value.first_name.trim(),
      // middle_name: form.value.middle_name.trim() ?? null,
      family_name: form.value.family_name.trim(),
      is_same_family_name: false,
      // nickname: form.value.nickname.trim() ?? null,
      relation_name: form.value.relation_type as RelationType,
      gender: form.value.gender,
      related_through: props.member.relationship_metadata?.related_through ?? null,
      parent_id: props.member.relationship_metadata?.parent_id ?? null,
      is_adoptive: props.member.relationship_metadata?.is_adoptive ?? false,
      is_former: props.member.relationship_metadata?.is_former ?? false,
      is_deceased: form.value.is_deceased,
      date_of_birth: form.value.date_of_birth,
      biography: (props.member as any).biography ?? null,
      ...(photoFile.value ? { profile_picture: photoFile.value } : {}),
    }

    // Use FormData when photo is attached
    let apiPayload: typeof data | FormData
    if (photoFile.value) {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          if (typeof v === 'boolean') {
            fd.append(k, v ? '1' : '0')
            return
          }
          fd.append(k, v instanceof File ? v : String(v))
        }
      })
      apiPayload = fd as unknown as typeof data
    } else {
      apiPayload = data
    }

    const response = await updateMutation.mutateAsync({ id: props.member.id, data: apiPayload as any })
    const savedMember = response.data as Partial<EditableMember> | undefined

    const updatedMember: EditableMember = {
      ...props.member,
      ...savedMember,
      first_name: form.value.first_name.trim(),
      // middle_name: form.value.middle_name.trim(),
      family_name: form.value.family_name.trim(),
      full_name: `${form.value.first_name.trim()} ${form.value.family_name.trim()}`.trim(),
      // nickname: form.value.nickname.trim() || null,
      gender: form.value.gender,
      date_of_birth: form.value.date_of_birth,
      is_deceased: form.value.is_deceased,
      profile_picture_url: savedMember?.profile_picture_url ?? props.member.profile_picture_url,
    }

    emit('saved', updatedMember)
    emit('update:show', false)
    message.success('Member updated')
  } catch {
    message.error('Failed to update member')
  } finally {
    isSaving.value = false
  }
}
</script>
