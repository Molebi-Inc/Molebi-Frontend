<template>
  <section>
    <h1 class="hidden md:block text-base font-semibold text-gray-700 mb-5">
      Privacy & Permissions
    </h1>

    <!-- Who Can View -->
    <div class="bg-white rounded-lg md:border border-secondary-100 py-5 px-4 mb-5 mt-6 md:mt-0">
      <h3 class="text-base font-semibold text-gray-700 mb-4">Who Can View</h3>
      <div class="flex flex-col gap-y-3">
        <n-checkbox
          v-for="option in viewOptions"
          :key="option.value"
          v-model:checked="option.checked"
          :checked-value="true"
          :unchecked-value="false"
          @update:checked="(checked) => handleViewChange(option.value, checked)"
        >
          <span class="text-sm text-gray-700">
            {{ option.label }}
          </span>
        </n-checkbox>
      </div>
    </div>

    <!-- Who Can Edit -->
    <div class="bg-white rounded-lg md:border border-secondary-100 py-5 px-4">
      <h3 class="text-base font-semibold text-gray-700 mb-4">Who Can Edit</h3>
      <div class="flex flex-col gap-y-3">
        <n-checkbox
          v-for="option in editOptions"
          :key="option.value"
          v-model:checked="option.checked"
          :checked-value="true"
          :unchecked-value="false"
          @update:checked="(checked) => handleEditChange(option.value, checked)"
        >
          <span class="text-sm text-gray-700">
            {{ option.label }}
          </span>
        </n-checkbox>
      </div>
    </div>

    <div class="mt-8 flex justify-center absolute bottom-0 left-0 right-0">
      <MlbButton
        label="Save Changes"
        primary
        :loading="loading"
        :disabled="loading"
        class="rounded-2xl! bg-primary-700! text-white! px-8! py-2.5! h-13! w-[370px]!"
        @click="savePrivacySettings"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage, NCheckbox } from 'naive-ui'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import type {
  PrivacySettings,
  PrivacyOption,
  ViewOptionValue,
  EditOptionValue,
} from '@/types/settings.types'
import { useUpdatePrivacySettingsMutation } from '@/services/settings.services'
import { useProfileStore } from '@/stores/profile.store'

const message = useMessage()
const profileStore = useProfileStore()
const updatePrivacySettingsMutation = useUpdatePrivacySettingsMutation()

const loading = computed(() => updatePrivacySettingsMutation.isPending.value)
const storePrivacySettings = computed(() => profileStore.privacySettings)

const viewOptions = ref<PrivacyOption<ViewOptionValue>[]>([
  {
    label: 'Only Me',
    value: 'only_me',
    checked: profileStore.privacySettings?.who_can_view_profile?.includes('only_me') || false,
  },
  {
    label: 'Family Members',
    value: 'family_members',
    checked:
      profileStore.privacySettings?.who_can_view_profile?.includes('family_members') || false,
  },
  {
    label: 'Extended Families',
    value: 'extended_family',
    checked:
      profileStore.privacySettings?.who_can_view_profile?.includes('extended_family') || false,
  },
  {
    label: 'Public Link (View Only)',
    value: 'public',
    checked: profileStore.privacySettings?.who_can_view_profile?.includes('public') || false,
  },
])

const editOptions = ref<PrivacyOption<EditOptionValue>[]>([
  {
    label: 'Only Admins',
    value: 'admin',
    checked: profileStore.privacySettings?.who_can_edit_profile?.includes('admin') || false,
  },
  {
    label: 'Anyone I Invite',
    value: 'user',
    checked: profileStore.privacySettings?.who_can_edit_profile?.includes('user') || false,
  },
])

const applyStoreSettings = (settings?: PrivacySettings | null) => {
  viewOptions.value = viewOptions.value.map((option) => ({
    ...option,
    checked: settings?.who_can_view_profile?.includes(option.value) ?? false,
  }))
  editOptions.value = editOptions.value.map((option) => ({
    ...option,
    checked: settings?.who_can_edit_profile?.includes(option.value) ?? false,
  }))
}

const setExclusiveSelection = <T extends string>(options: PrivacyOption<T>[], selectedValue: T) => {
  return options.map((option) => ({
    ...option,
    checked: option.value === selectedValue,
  }))
}

const handleViewChange = (value: ViewOptionValue, checked: boolean) => {
  if (!checked) {
    return
  }
  viewOptions.value = setExclusiveSelection(viewOptions.value, value)
}

const handleEditChange = (value: EditOptionValue, checked: boolean) => {
  if (!checked) {
    return
  }
  editOptions.value = setExclusiveSelection(editOptions.value, value)
}

const savePrivacySettings = async () => {
  try {
    const payload: PrivacySettings = {
      who_can_view_profile: viewOptions.value
        .filter((option: PrivacyOption<ViewOptionValue>) => option.checked)
        .map((option: PrivacyOption<ViewOptionValue>) => option.value),
      who_can_edit_profile: editOptions.value
        .filter((option: PrivacyOption<EditOptionValue>) => option.checked)
        .map((option: PrivacyOption<EditOptionValue>) => option.value),
    }

    const response = await updatePrivacySettingsMutation.mutateAsync(payload)
    message.success(response.message || 'Privacy settings saved successfully')
  } catch (error) {
    handleApiError(error, message)
  }
}

watch(
  () => storePrivacySettings.value,
  (newSettings) => {
    applyStoreSettings(newSettings)
  },
  { immediate: true },
)
</script>
