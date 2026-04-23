<template>
  <!-- Type selector step -->
  <MlbModal v-if="step === 'select'" :show="show" :max-width="480" :bottom-sheet="isMobile" :bottom-sheet-height="600"
    class="rounded-3xl!" @update:show="$emit('update:show', false)">
    <template #header>
      <div class="flex items-center justify-between">
        <button
          class="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors"
          @click="$emit('update:show', false)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 1.06-1.06z" />
          </svg>
        </button>
        <h3 class="text-base font-semibold text-neutral-900">Add Timeline</h3>
        <div class="w-7" />
      </div>
      <p class="text-center text-sm text-neutral-500 mt-1">Select which timeline to add to {{ memberFirstName }}</p>
    </template>

    <div class="flex flex-col gap-2 -mx-1">
      <div v-for="type in visibleTypes" :key="type.value"
        class="flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-colors"
        :class="isDisabled(type.value)
          ? 'border-neutral-100 bg-neutral-50 cursor-not-allowed opacity-50'
          : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 cursor-pointer'"
        @click="!isDisabled(type.value) && (type.value === 'all' ? showAll = true : selectType(type.value))">
        <span class="text-sm font-medium text-neutral-800">{{ type.label }}</span>
        <span class="text-sm font-semibold transition-colors"
          :class="isDisabled(type.value) ? 'text-neutral-400' : 'text-primary-700 hover:text-primary-800'">
          {{ isDisabled(type.value) ? 'Added' : type.value === 'all' ? 'View all' : 'Add' }}
        </span>
      </div>
    </div>
  </MlbModal>

  <!-- Entry form step -->
  <MlbModal v-else-if="step === 'form'" :show="show" :max-width="480" :bottom-sheet="isMobile"
    :bottom-sheet-height="520" class="rounded-3xl!" @update:show="$emit('update:show', false)">
    <template #header>
      <div class="flex items-center justify-between">
        <button
          class="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors"
          @click="isEditing ? $emit('update:show', false) : (step = 'select')">
          <svg v-if="isEditing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            class="w-4 h-4">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 1.06-1.06z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clip-rule="evenodd" />
          </svg>
        </button>
        <h3 class="text-base font-semibold text-neutral-900">{{ selectedTypeLabel }}</h3>
        <button
          class="w-7 h-7 flex items-center justify-center text-primary-700 hover:text-primary-800 transition-colors"
          :class="{ 'opacity-40 pointer-events-none': saving }" @click="submit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </template>

    <div class="flex flex-col gap-5">
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Date</label>
        <input v-model="form.event_date" type="date" placeholder="DD MM YYYY"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors" />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Place</label>
        <input v-model="form.place" type="text" placeholder="Place of event"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400" />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-600 mb-2">Description</label>
        <textarea v-model="form.description" rows="4" placeholder="Description of event"
          class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400 resize-none" />
      </div>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import type { TimelineType, TimelineEntryInterface } from '@/types/family-tree.types'
import {
  useCreateTimelineMutation,
  useUpdateTimelineMutation,
} from '@/services/family-tree.service'

const props = defineProps<{
  show: boolean
  memberId: number
  memberFirstName: string
  existingTypes?: string[]
  /** When set, opens directly to the form in edit mode */
  editEntry?: TimelineEntryInterface | null
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
  (e: 'saved'): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const message = useMessage()

type Step = 'select' | 'form'
const step = ref<Step>('select')
const selectedType = ref<TimelineType | null>(null)
const saving = ref(false)

const isEditing = computed(() => !!props.editEntry)

const ONCE_ONLY_TYPES = ['birth']
const isDisabled = (value: string) => ONCE_ONLY_TYPES.includes(value) && (props.existingTypes ?? []).includes(value)

const showAll = ref(false)
const visibleTypes = computed(() =>
  showAll.value
    ? TIMELINE_TYPES.filter((t) => t.value !== 'all')
    : TIMELINE_TYPES.filter((t) => t.section === 'main'),
)

const form = ref({
  event_date: '',
  place: '',
  description: '',
})

const TIMELINE_TYPES: { label: string; value: TimelineType, section: string }[] = [
  { label: 'Birth', value: 'birth', section: 'main' },
  { label: 'Marriage', value: 'marriage', section: 'main' },
  { label: 'Divorce', value: 'divorce', section: 'full' },
  { label: 'Education', value: 'education', section: 'main' },
  { label: 'Award', value: 'award', section: 'full' },
  { label: 'Church', value: 'church', section: 'full' },
  { label: 'Retirement', value: 'retirement', section: 'full' },
  { label: 'Skills', value: 'skill', section: 'full' },
  { label: 'Occupation', value: 'occupation', section: 'full' },
  { label: 'Burial', value: 'burial', section: 'full' },
  { label: 'Achievements', value: 'achievement', section: 'main' },
  { label: 'All Timeline', value: 'all', section: 'main' },
]

const selectedTypeLabel = computed(
  () => TIMELINE_TYPES.find((t) => t.value === selectedType.value)?.label ?? 'Timeline',
)

const createMutation = useCreateTimelineMutation(computed(() => props.memberId))
const updateMutation = useUpdateTimelineMutation(
  computed(() => props.memberId),
  computed(() => props.editEntry?.id ?? 0),
)

const selectType = (type: TimelineType) => {
  selectedType.value = type
  step.value = 'form'
}

const submit = async () => {
  if (!selectedType.value && !isEditing.value) return
  saving.value = true
  try {
    const type = isEditing.value ? props.editEntry!.type : selectedType.value!
    const payload = {
      type,
      title: TIMELINE_TYPES.find((t) => t.value === type)?.label ?? type,
      event_date: form.value.event_date,
      place: form.value.place,
      description: form.value.description,
    }
    if (isEditing.value) {
      await updateMutation.mutateAsync(payload)
    } else {
      await createMutation.mutateAsync(payload)
    }
    emit('saved')
    emit('update:show', false)
  } catch {
    message.error('Failed to save timeline entry')
  } finally {
    saving.value = false
  }
}

// Reset or pre-fill when modal opens/editEntry changes
watch(
  () => props.show,
  (val) => {
    if (!val) return
    if (props.editEntry) {
      selectedType.value = props.editEntry.type
      form.value = {
        event_date: props.editEntry.event_date ?? '',
        place: props.editEntry.place ?? '',
        description: props.editEntry.description ?? '',
      }
      step.value = 'form'
    } else {
      selectedType.value = null
      form.value = { event_date: '', place: '', description: '' }
      step.value = 'select'
      showAll.value = false
    }
  },
  { immediate: true },
)
</script>
