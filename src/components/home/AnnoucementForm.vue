<template>
  <div class="flex flex-col gap-6">
    <!-- Form -->
    <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-6 px-0 md:px-10">
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
        <n-form-item path="content" :show-require-mark="false" :show-feedback="false">
          <n-input
            v-model:value="form.content"
            type="textarea"
            placeholder="Add a Content..."
            rows="2"
            class="w-full borderless"
          />
        </n-form-item>
      </div>

      <!-- Type Select -->
      <!-- <n-form-item path="type" :show-require-mark="false" :show-feedback="false">
        <template #label>
          <label for="type" class="text-sm font-medium text-gray-500">Select Type</label>
        </template>
        <NSelect
          v-model:value="form.type"
          :options="typeOptions"
          placeholder="Select Type"
          size="large"
          class="w-full rounded!"
        />
      </n-form-item> -->

      <!-- Priority Select -->
      <n-form-item path="priority" :show-require-mark="false" :show-feedback="false">
        <template #label>
          <label for="priority" class="text-sm font-medium text-gray-500">Select Priority</label>
        </template>
        <NSelect
          v-model:value="form.priority"
          :options="formattedPriorityOptions"
          placeholder="Select Priority"
          size="large"
          class="w-full mlb-select"
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

      <!-- Reminder Checkbox -->
      <div class="flex items-center gap-2 mb-11">
        <NCheckbox v-model:checked="form.create_reminder" />
        <label class="text-sm font-medium text-gray-500">Create a reminder</label>
      </div>

      <!-- Create Button -->
      <MlbButton
        type="submit"
        label="Create"
        :loading="!!loading"
        :disabled="!!loading"
        :primary="true"
        class="w-full rounded-2xl! h-13!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHome } from '@/composables/useHome'
import MlbInput from '@/components/ui/MlbInput.vue'
import type { FormInst, SelectOption } from 'naive-ui'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useGeneralStore } from '@/stores/general.store'
import { typeOptions } from '@/constants/options.constants'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import UserSelector from '@/components/common/UserSelector.vue'
import { priorityOptions } from '@/constants/priority.constants'
import { announcementValidation } from '@/validations/dashboard.validations'
import type { UserSelectorOptions } from '@/components/common/UserSelector.vue'
import { useMessage, NForm, NFormItem, NInput, NSelect, NCheckbox } from 'naive-ui'
import { useAnnouncementStore } from '@/stores/announcement.store'

const message = useMessage()
const generalStore = useGeneralStore()
const announcementStore = useAnnouncementStore()
const { form, rules } = announcementValidation()
const { loading, createAnnouncement, fetchFamilyMembers } = useHome()

const formRef = ref<FormInst | null>(null)
const userSelectorOptions: UserSelectorOptions = {
  form_user_ids_field: 'member_ids',
  search_fields: ['first_name', 'middle_name', 'family_name'],
  avatar_field: 'profile_picture_url',
  name_fields: ['first_name', 'middle_name', 'family_name'],
}

const familyMembers = computed<FamilyMemberInterface[]>(() => generalStore.familyMembers)

// Format priority options for NSelect
const formattedPriorityOptions = computed<SelectOption[]>(() => {
  return priorityOptions.map((option) => ({
    label: option.label,
    value: option.value,
  }))
})

const emit = defineEmits<{
  (e: 'submit', data: typeof form.value): void
  (e: 'close'): void
}>()

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }
    await createAnnouncement(form.value)
    emit('submit', form.value)
    emit('close')
  })
}

const updateForm = (value: number[]) => {
  form.value.member_ids = value
}

const getEditData = () => {
  const selectedAnnouncement = announcementStore.selectedAnnouncement
  if (selectedAnnouncement) {
    form.value = {
      title: selectedAnnouncement.title,
      content: selectedAnnouncement.content,
      type: null,
      priority: selectedAnnouncement.priority,
      member_ids: selectedAnnouncement.members.map((member: FamilyMemberInterface) => member.id),
      create_reminder: selectedAnnouncement.send_to_all,
    }
  }
}

onMounted(() => {
  fetchFamilyMembers()
  getEditData()
})
</script>

<style scoped>
:deep(.n-checkbox-box--checked) {
  background-color: #16a34a;
  border-color: #16a34a;
}
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
:deep(.title-input .n-input__input-el) {
  font-size: 24px !important;
  font-weight: 700 !important;
  color: #1f1f1f !important;
  line-height: 150% !important;
  font-family: General Sans;
}
</style>
