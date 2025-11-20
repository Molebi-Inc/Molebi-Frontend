<template>
  <section class="flex flex-col gap-5">
    <h1 class="hidden md:block text-base font-semibold text-gray-700 mb-5">Profile</h1>
    <!-- User Profile Header -->
    <div
      class="hidden md:flex items-center gap-4 border border-secondary-100 rounded-2xl p-2.5 mt-6 md:mt-0"
    >
      <div class="shrink-0">
        <n-upload
          :max="1"
          :show-file-list="false"
          :default-upload="false"
          @change="handleFileChange"
          class="cursor-pointer inline-flex"
          :style="{ width: 'auto' }"
        >
          <div
            class="w-13 h-13 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative group hover:opacity-90 transition-opacity"
          >
            <img
              :src="profileStore.userAvatarUrl"
              :alt="displayName"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div
              class="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all"
            >
              <span
                class="text-gray-700 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >Change</span
              >
            </div>
          </div>
        </n-upload>
      </div>
      <div class="min-w-0">
        <h2 class="text-lg font-medium text-gray-700">
          {{ displayName }}
        </h2>
      </div>
    </div>
    <!-- Personal Information -->
    <div class="rounded-2xl md:border border-secondary-100 p-6">
      <div class="flex items-center justify-between mb-7">
        <h3 class="font-semibold text-gray-700">Personal Information</h3>
        <MlbButton
          text
          :label="isEditingProfile ? 'Cancel' : 'Edit'"
          type="submit"
          class="text-primary-500! hover:text-primary-700!"
          @click="isEditingProfile = !isEditingProfile"
        />
      </div>

      <div v-if="isEditingProfile">
        <ProfileForm />
      </div>
      <div v-else class="grid grid-cols-2 gap-6">
        <div v-for="detail in mappedUserDetails" :key="detail.label">
          <label class="text-sm font-medium text-gray-500 mb-1">{{ detail.label }}</label>
          <p class="text-gray-700">{{ detail.value }}</p>
        </div>
      </div>
    </div>

    <!-- Delete Account Button -->
    <div class="mt-12 hidden md:flex justify-center">
      <MlbButton
        text
        label="Delete Account"
        type="submit"
        class="text-red-600! hover:text-red-700!"
        @click="deleteAccount"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMessage, NUpload } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import { useProfileStore } from '@/stores/profile.store'
import ProfileForm from '@/components/settings/ProfileForm.vue'
import { useDeleteProfileMutation } from '@/services/settings.services'
import { usePhoto } from '@/composables/usePhoto'

const message = useMessage()
const { handlePhotoUpload } = usePhoto()
const profileStore = useProfileStore()
const deleteProfileMutation = useDeleteProfileMutation()

const isEditingProfile = ref<boolean>(false)

const displayName = computed(() => {
  const firstName = profileStore.user?.first_name?.trim()
  const familyName = profileStore.user?.family_name?.trim()
  const hasName = Boolean(firstName || familyName)
  return hasName ? `${firstName ?? ''} ${familyName ?? ''}`.trim() : 'Molebi User'
})

const mappedUserDetails = computed(() => {
  return {
    first_name: { label: 'First Name', value: profileStore.user?.first_name },
    family_name: { label: 'Family Name / Surname', value: profileStore.user?.family_name },
    email: { label: 'Email', value: profileStore.user?.email },
    phone: { label: 'Phone', value: profileStore.user?.phone },
  }
})

const handleFileChange = async ({ file }: { file: UploadFileInfo }) => {
  if (!file.file) {
    message.error('No file selected')
    return
  }
  await handlePhotoUpload(file.file)
}

const deleteAccount = async () => {
  try {
    await deleteProfileMutation.mutateAsync()
    message.success('Account deleted successfully')
  } catch (error) {
    handleApiError(error, message)
  }
}
</script>
