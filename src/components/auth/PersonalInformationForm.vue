<template>
  <div>
    <n-form ref="formRef" :label-width="80" :model="form" :rules="rules">
      <div class="flex flex-col gap-1 mb-11">
        <n-form-item label="" path="avatar">
          <n-upload
            :max="1"
            directory-dnd
            accept="image/*"
            list-type="image-card"
            trigger-class="trigger4dragger"
            file-list-class="flex! justify-center items-center rounded-full!"
            @update:file-list="updateFileList"
          >
            Click to Upload
          </n-upload>
        </n-form-item>
        <n-form-item label="First Name" path="first_name">
          <MlbInput
            v-model="form.first_name"
            id="first_name"
            name="first_name"
            type="text"
            :disabled="!!user?.first_name"
            placeholder="Enter First Name"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Middle Name" path="middle_name">
          <MlbInput
            v-model="form.middle_name"
            id="middle_name"
            name="middle_name"
            type="text"
            :disabled="!!user?.middle_name"
            placeholder="Enter Middle Name"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <!-- <n-form-item label="Nickname" path="nickname">
          <MlbInput
            v-model="form.nickname"
            id="nickname"
            name="nickname"
            type="text"
            placeholder="Enter Nickname"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item> -->
        <n-form-item label="Family Name / Surname" path="family_name">
          <MlbInput
            v-model="form.family_name"
            id="family_name"
            name="family_name"
            type="text"
            :disabled="!!user?.family_name"
            placeholder="Enter Family Name"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Date of Birth" path="dob">
          <n-date-picker
            v-model:formatted-value="form.dob"
            id="dob"
            name="dob"
            type="date"
            :disabled="!!user?.dob"
            placeholder="Enter Date of Birth"
            class="w-full"
          />
        </n-form-item>
        <n-form-item
          label="Gender"
          path="gender"
          label-style="color: #807F94; font-weight: 500;"
          required
        >
          <NSelect
            v-model:value="form.gender"
            :options="genderOptions"
            placeholder="Select Gender"
            :disabled="!!user?.gender"
            size="large"
            class="w-full mlb-select"
          >
            <template #arrow>
              <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
            </template>
          </NSelect>
        </n-form-item>
        <n-form-item
          label="State of Origin"
          path="state_id"
          label-style="color: #807F94; font-weight: 500;"
          required
        >
          <NSelect
            v-model:value="form.state_id"
            :options="states"
            placeholder="Select State"
            :disabled="!!user?.state_id"
            :loading="statesLoading"
            size="large"
            class="w-full mlb-select"
          >
            <template #arrow>
              <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
            </template>
          </NSelect>
        </n-form-item>
        <n-form-item
          label="Community/Local Government"
          path="community_name"
          label-style="color: #807F94; font-weight: 500;"
          required
        >
          <MlbInput
            v-model="form.community_name"
            placeholder="Enter Community"
            custom-class="w-full"
            :disabled="!!user?.community_name"
          />
        </n-form-item>
      </div>
      <div class="flex items-start gap-2 bg-primary-50 p-3 rounded-xl text-primary-900 mb-11">
        <div>
          <MlbIcon name="material.info.outline.rounded" :size="14" />
        </div>
        <div class="text-[10px]">
          All details you provide are private and protected. No one else can access them without
          your permission and your date of birth would not be visible to anyone but you.
        </div>
      </div>
      <MlbButton
        type="submit"
        :label="loading ? 'Continuing...' : 'Continue'"
        :loading="loading"
        :disabled="loading"
        block
        class="rounded-2xl! bg-primary-700! h-13! text-white!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { FormInst, UploadFileInfo } from 'naive-ui'
import { ref, computed, onMounted, watch } from 'vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import { useGetStatesQuery } from '@/services/general.service'
import type { StateInterface } from '@/types/general.types'
import { useUpdateProfileMutation } from '@/services/authentication.services'
import { personalInformationValidation } from '@/validations/authentication.validations'
import { NForm, NFormItem, NDatePicker, useMessage, NSelect, NUpload } from 'naive-ui'
import type { PersonalInformationFormValues } from '@/types/authentication.types'
import { useProfileStore } from '@/stores/profile.store'
import { useMemberForm } from '@/composables/member-form.composables'

const $router = useRouter()
const message = useMessage()
const profileStore = useProfileStore()
const statesQuery = useGetStatesQuery()
const { form, rules } = personalInformationValidation()
const updateProfileMutation = useUpdateProfileMutation()

const { genderOptions } = useMemberForm('self')

const formRef = ref<FormInst | null>(null)
const loading = computed(() => updateProfileMutation.isPending.value)
const statesLoading = computed(() => statesQuery.isLoading.value || statesQuery.isFetching.value)

// Transform states data into select options format
const states = computed(() => {
  return (
    statesQuery.data.value?.data?.map((state: StateInterface) => ({
      label: state.name,
      value: state.id,
    })) ?? []
  )
})

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      const response = await updateProfileMutation.mutateAsync(form.value)

      message.success(response.message || 'Profile updated successfully')

      $router.push({ name: 'App.HomeView' })
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

const getValidFiles = (fileList: UploadFileInfo[]) =>
  fileList
    .map((file) => file.file)
    .filter((maybeFile): maybeFile is File => maybeFile instanceof File)

const updateFileList = (fileList: UploadFileInfo[]) => {
  console.log('fileList', fileList)
  ;(form.value as PersonalInformationFormValues).avatar = getValidFiles(fileList)[0]
}

const user = computed(() => profileStore.user)

const fetchFormData = () => {
  form.value = {
    first_name: user.value?.first_name || '',
    middle_name: user.value?.middle_name || '',
    family_name: user.value?.family_name || '',
    dob: user.value?.dob || null,
    state_id: user.value?.state_id || null,
    community_name: user.value?.community_name || '',
    mother_family_name: user.value?.mother_family_name || '',
    nickname: user.value?.nickname || '',
    avatar: user.value?.avatar || null,
    gender: user.value?.gender || null,
  }
}

// Watch for query errors and handle them
watch(
  () => statesQuery.isError.value,
  (isError) => {
    if (isError && statesQuery.error.value) {
      handleApiError(statesQuery.error.value, message)
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchFormData()
  // Query will automatically fetch states when component mounts
  // States are cached for 1 hour, so subsequent visits will be instant
})
</script>
<style scoped>
:deep(.trigger4dragger .n-upload-dragger) {
  border-radius: 100% !important;
}
</style>
