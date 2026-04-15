<template>
  <div class="space-y-5">
    <!-- Relationship status -->
    <div>
      <label class="block text-sm font-medium text-neutral-600 mb-2">Relationship</label>
      <div class="relative">
        <select
          :value="modelValue.relationship_status ?? ''"
          class="w-full appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors pr-10"
          @change="update('relationship_status', (($event.target as HTMLSelectElement).value || null) as V2MemberFormData['relationship_status'])"
        >
          <option value="">Select relationship</option>
          <option
            v-for="opt in relationshipStatusOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
        >
          <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Married date -->
    <div>
      <label class="block text-sm font-medium text-neutral-600 mb-2">Date of Marriage</label>
      <input
        type="date"
        :value="modelValue.married_date ?? ''"
        placeholder="DD MM YYYY"
        class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors"
        @input="update('married_date', ($event.target as HTMLInputElement).value || null)"
      />
    </div>

    <!-- Place of marriage -->
    <div>
      <label class="block text-sm font-medium text-neutral-600 mb-2">Place of Marriage</label>
      <input
        type="text"
        :value="modelValue.place_of_marriage"
        placeholder="Enter place of marriage"
        class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400"
        @input="update('place_of_marriage', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Gender -->
    <div>
      <label class="block text-sm font-medium text-neutral-600 mb-2">Gender</label>
      <div class="flex gap-3">
        <label
          v-for="opt in genderOptions"
          :key="opt.value"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors"
          :class="
            modelValue.gender === opt.value
              ? 'border-primary-400 bg-primary-50 text-primary-700'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
          "
          @click="update('gender', opt.value)"
        >
          <span
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
            :class="modelValue.gender === opt.value ? 'border-primary-600' : 'border-neutral-300'"
          >
            <span
              v-if="modelValue.gender === opt.value"
              class="w-2 h-2 rounded-full bg-primary-600"
            />
          </span>
          <span class="text-sm font-medium">{{ opt.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { V2MemberFormData } from '../member-type.config'

interface Props {
  modelValue: V2MemberFormData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: V2MemberFormData): void
}>()

const update = <K extends keyof V2MemberFormData>(key: K, value: V2MemberFormData[K]) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const relationshipStatusOptions: {
  value: NonNullable<V2MemberFormData['relationship_status']>
  label: string
}[] = [
  { value: 'married', label: 'Married' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
]

const genderOptions: { value: 'male' | 'female'; label: string }[] = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Woman' },
]
</script>
