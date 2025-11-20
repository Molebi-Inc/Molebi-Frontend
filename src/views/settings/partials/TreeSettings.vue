<template>
  <section>
    <h1 class="text-base font-semibold text-gray-700 mb-5 hidden md:block">Tree</h1>

    <div
      class="bg-white rounded-lg md:border border-secondary-100 py-5 px-4 space-y-6 mt-6 md:mt-0"
    >
      <div
        v-for="setting in treeSettings"
        :key="setting.value"
        class="grid grid-cols-6 gap-x-12 gap-y-4"
      >
        <label class="text-sm font-medium text-gray-700 leading-[150%] col-span-5 md:col-span-3">{{
          setting.label
        }}</label>
        <n-switch
          v-model:value="setting.checked"
          class="md:col-span-3 justify-self-end md:justify-self-start"
        />
      </div>
    </div>

    <div class="mt-8 flex justify-center absolute bottom-0 left-0 right-0">
      <MlbButton
        primary
        :loading="loading"
        :disabled="loading"
        label="Save Changes"
        class="rounded-2xl! bg-primary-700! text-white! px-8! py-2.5! h-13! w-[370px]!"
        @click="saveTreeSettings"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage, NSwitch } from 'naive-ui'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import type { TreeSettings, TreeSettingsForm } from '@/types/settings.types'
import { useUpdateTreeSettingsMutation } from '@/services/settings.services'
import { useProfileStore } from '@/stores/profile.store'

const message = useMessage()
const profileStore = useProfileStore()
const updateTreeSettingsMutation = useUpdateTreeSettingsMutation()

const loading = computed(() => updateTreeSettingsMutation.isPending.value)
const storeTreeSettings = computed(() => profileStore.treeSettings)

const treeSettings = ref<TreeSettingsForm[]>([
  {
    label: 'Show relationship titles',
    value: 'is_display_relationship_tiles',
    checked: false,
  },
  {
    label: 'Show full names',
    value: 'is_display_full_name',
    checked: false,
  },
  {
    label: 'Show only direct connections',
    value: 'is_display_only_direct_connections',
    checked: false,
  },
])

const applyStoreSettings = (settings?: TreeSettings | null) => {
  treeSettings.value = treeSettings.value.map((setting) => ({
    ...setting,
    checked: settings?.[setting.value] ?? false,
  }))
}

const saveTreeSettings = async () => {
  try {
    const payload = treeSettings.value.reduce((acc, setting) => {
      acc[setting.value] = setting.checked
      return acc
    }, {} as TreeSettings)

    const response = await updateTreeSettingsMutation.mutateAsync(payload)
    message.success(response.message || 'Tree settings saved successfully')
  } catch (error) {
    handleApiError(error, message)
  }
}

watch(
  () => storeTreeSettings.value,
  (newSettings) => {
    applyStoreSettings(newSettings)
  },
  { immediate: true },
)
</script>
