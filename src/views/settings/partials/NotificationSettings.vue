<template>
  <section>
    <h1 class="hidden md:block text-base font-semibold text-gray-700 mb-5">Notification</h1>

    <!-- General Notifications -->
    <div class="bg-white rounded-lg md:border border-secondary-100 py-5 px-4 mb-5 mt-6 md:mt-0">
      <h3 class="text-base font-semibold text-gray-700 mb-4">General</h3>
      <div class="space-y-7">
        <div
          v-for="option in generalOptions"
          :key="option.key"
          class="grid grid-cols-6 gap-x-12 gap-y-4"
        >
          <label class="text-sm text-gray-700 col-span-5 md:col-span-3">{{ option.label }}</label>
          <n-switch
            v-model:value="option.checked"
            class="md:col-span-3 justify-self-end md:justify-self-start"
          />
        </div>
      </div>
    </div>

    <!-- Delivery Channels -->
    <div class="bg-white rounded-lg md:border border-secondary-100 py-5 px-4">
      <h3 class="text-base font-semibold text-gray-700 mb-4">Delivery Channels</h3>
      <div class="space-y-7">
        <div
          v-for="option in deliveryOptions"
          :key="option.key"
          class="grid grid-cols-6 gap-x-12 gap-y-4"
        >
          <label class="text-sm text-gray-700 col-span-5 md:col-span-3">{{ option.label }}</label>
          <n-switch
            v-model:value="option.checked"
            class="md:col-span-3 justify-self-end md:justify-self-start"
          />
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-center absolute bottom-0 left-0 right-0">
      <MlbButton
        label="Save Changes"
        primary
        :loading="loading"
        :disabled="loading"
        class="rounded-2xl! bg-primary-700! text-white! px-8! py-2.5! h-13! w-[370px]!"
        @click="saveNotificationSettings"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NSwitch, useMessage } from 'naive-ui'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import { useProfileStore } from '@/stores/profile.store'
import type { NotificationOptions } from '@/types/settings.types'
import type { NotificationSettings } from '@/types/settings.types'
import { useUpdateNotificationSettingsMutation } from '@/services/settings.services'

const message = useMessage()
const profileStore = useProfileStore()
const updateNotificationSettingsMutation = useUpdateNotificationSettingsMutation()

const loading = computed(() => updateNotificationSettingsMutation.isPending.value)
const storeNotificationSettings = computed(() => profileStore.notificationSettings)

const generalOptions = ref<NotificationOptions[]>([
  {
    key: 'is_birthday_anniversary_reminder',
    label: 'Birthdays & Anniversaries',
    checked: false,
  },
  {
    key: 'is_family_member_added',
    label: 'New Family Member Added',
    checked: false,
  },
  {
    key: 'is_photo_added',
    label: 'Photos or Memories Added',
    checked: false,
  },
  {
    key: 'is_tree_updated_and_invite_sent',
    label: 'Tree Updates / Invites',
    checked: false,
  },
])

const deliveryOptions = ref<NotificationOptions[]>([
  {
    key: 'is_enabled_email_notifications',
    label: 'Email Notifications',
    checked: false,
  },
  {
    key: 'is_enabled_push_notifications',
    label: 'Push Notifications',
    checked: false,
  },
])

const syncOptionsWithProfile = (settings?: NotificationSettings | null) => {
  if (!settings) {
    return
  }

  const applySettings = (options: NotificationOptions[]) =>
    options.map((option) => ({
      ...option,
      checked: settings[option.key] ?? option.checked,
    }))

  generalOptions.value = applySettings(generalOptions.value)
  deliveryOptions.value = applySettings(deliveryOptions.value)
}

const saveNotificationSettings = async () => {
  try {
    const payload = [...generalOptions.value, ...deliveryOptions.value].reduce((acc, option) => {
      acc[option.key] = option.checked
      return acc
    }, {} as NotificationSettings)

    const response = await updateNotificationSettingsMutation.mutateAsync(payload)
    message.success(response.message || 'Notification settings saved successfully')
  } catch (error) {
    handleApiError(error, message)
  }
}

watch(
  () => storeNotificationSettings.value,
  (newSettings) => {
    syncOptionsWithProfile(newSettings)
  },
  { immediate: true },
)
</script>
