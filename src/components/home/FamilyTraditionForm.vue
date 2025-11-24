<template>
  <div class="flex flex-col gap-6">
    <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-6 px-10">
      <div>
        <n-form-item path="title" :show-require-mark="false" :show-feedback="false">
          <MlbInput
            id="title"
            v-model="form.title"
            name="title"
            type="text"
            placeholder="Add a Title.."
            custom-class="w-full borderless title-input"
          />
        </n-form-item>
        <hr class="border-gray-200" />
        <n-form-item path="description" :show-require-mark="false" :show-feedback="false">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="Add a Description..."
            rows="2"
            class="w-full borderless"
          />
        </n-form-item>
      </div>

      <!-- Priority Select -->
      <n-input-group class="grid grid-cols-2 gap-4">
        <n-form-item path="date" :show-require-mark="false" :show-feedback="false" class="w-full">
          <template #label>
            <label for="reoccurrence" class="text-sm font-medium text-gray-500">Date</label>
          </template>
          <n-date-picker
            v-model:formatted-value="form.date"
            value-format="yyyy-MM-dd"
            type="date"
          />
        </n-form-item>
        <n-form-item path="time" :show-require-mark="false" :show-feedback="false" class="w-full">
          <template #label>
            <label for="time" class="text-sm font-medium text-gray-500">Time (Optional)</label>
          </template>
          <NSelect
            v-model:value="timeSelectValue"
            placeholder="Select Time"
            :options="timeOptions"
            size="large"
            class="w-full rounded!"
          />
        </n-form-item>
      </n-input-group>

      <!-- Priority Select -->
      <n-form-item path="recurrence" :show-require-mark="false" :show-feedback="false">
        <template #label>
          <label for="recurrence" class="text-sm font-medium text-gray-500"
            >Select Reoccurrence</label
          >
        </template>
        <NSelect
          v-model:value="form.recurrence"
          placeholder="Select Reoccurrence"
          :options="reoccurrenceOptions"
          size="large"
          class="w-full rounded!"
        />
      </n-form-item>

      <!-- Date Mode Select -->
      <n-form-item
        v-if="form.recurrence === 'annually'"
        path="date_mode"
        :show-require-mark="false"
        :show-feedback="false"
      >
        <template #label>
          <label for="date_mode" class="text-sm font-medium text-gray-500">Date Mode</label>
        </template>
        <NSelect
          v-model:value="form.date_mode"
          :options="dateModeOptions"
          placeholder="Select Date Mode"
          size="large"
          class="w-full rounded!"
        />
      </n-form-item>

      <!-- Family Member Selection -->
      <UserSelector
        label="Family Members"
        :form="form"
        :users="familyMembers"
        :options="userSelectorOptions"
        @update:selected-users="updateForm"
      />

      <!-- Create Button -->
      <MlbButton
        type="submit"
        label="Create"
        :disabled="!!loading"
        :loading="!!loading"
        :primary="true"
        class="w-full rounded-2xl! h-13!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>
<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { onMounted, ref, computed } from 'vue'
import { useHome } from '@/composables/useHome'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useGeneralStore } from '@/stores/general.store'
import UserSelector from '@/components/common/UserSelector.vue'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { useFamilyTraditionStore } from '@/stores/family-tradition.store'
import { familyTraditionValidation } from '@/validations/dashboard.validations'
import type { UserSelectorOptions } from '@/components/common/UserSelector.vue'
import { convertTimeFromHIFormat, convertTimeToHIFormat } from '@/helpers/general.helpers'
import { dateModeOptions, reoccurrenceOptions, timeOptions } from '@/constants/options.constants'
import { useMessage, NForm, NFormItem, NInput, NSelect, NDatePicker, NInputGroup } from 'naive-ui'

const message = useMessage()
const generalStore = useGeneralStore()
const familyTraditionStore = useFamilyTraditionStore()
const { loading, createFamilyTradition, fetchFamilyMembers } = useHome()

const formRef = ref<FormInst | null>(null)
const userSelectorOptions: UserSelectorOptions = {
  form_user_ids_field: 'family_member_ids',
  search_fields: ['first_name', 'middle_name', 'family_name'],
  avatar_field: 'profile_picture_url',
  name_fields: ['first_name', 'middle_name', 'family_name'],
}
const { form, rules } = familyTraditionValidation()

// Mock family members data - replace with actual API call
const familyMembers = computed(() => generalStore.familyMembers)

const emit = defineEmits<{
  (e: 'submit', data: typeof form.value): void
  (e: 'close'): void
}>()

// Computed property with getter/setter for bidirectional conversion
const timeSelectValue = computed({
  get: () => {
    return convertTimeFromHIFormat(form.value.time) || null
  },
  set: (value: string | null) => {
    form.value.time = convertTimeToHIFormat(value) || null
  },
})

const updateForm = (value: number[]) => {
  form.value.family_member_ids = value
}

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }
    createFamilyTradition(form.value)
    emit('submit', form.value)
    emit('close')
  })
}

const getEditData = () => {
  const selectedFamilyTradition = familyTraditionStore.selectedFamilyTradition
  if (selectedFamilyTradition) {
    form.value = {
      title: selectedFamilyTradition.title,
      description: selectedFamilyTradition.description,
      date: selectedFamilyTradition.date,
      time: selectedFamilyTradition.time,
      recurrence: selectedFamilyTradition.recurrence,
      date_mode: null,
      family_member_ids: selectedFamilyTradition.members.map((member) => member.id),
    }
  }
}

onMounted(() => {
  fetchFamilyMembers()
  getEditData()
})
</script>

<style scoped>
:deep(.n-input.borderless) {
  --n-border: none !important;
  --n-border-hover: none !important;
  --n-border-focus: none !important;
  --n-box-shadow-focus: none !important;
}

:deep(.title-input .n-input__placeholder) {
  font-size: 24px !important;
  font-weight: 700 !important;
  color: #bababa !important;
  line-height: 150% !important;
  font-family: General Sans;
}
</style>
