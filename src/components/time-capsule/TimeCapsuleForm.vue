<template>
  <div class="flex flex-col gap-6">
    <!-- Form -->
    <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-6 px-3 md:px-10">
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

      <!-- Upload Media -->
      <div v-if="isLargeScreen || $route.params.step == '1'">
        <n-upload
          list-type="image-card"
          accept="image/*"
          :file-list="uploadFileList"
          @update:file-list="handleFileListUpdate"
        />
      </div>

      <div v-if="isLargeScreen || $route.params.step == '2'">
        <n-form-item
          path="open_at"
          :show-require-mark="false"
          :show-feedback="false"
          class="w-full"
        >
          <template #label>
            <label for="open_at" class="text-sm font-medium text-gray-500">Open Date</label>
          </template>
          <n-date-picker
            v-model:formatted-value="form.open_at"
            value-format="yyyy-MM-dd"
            type="date"
            class="w-full"
          />
        </n-form-item>
      </div>

      <!-- Family Member Selection -->
      <n-form-item path="family_member_ids" :show-require-mark="true">
        <UserSelector
          v-if="isLargeScreen || $route.params.step == '2'"
          label="Family Members"
          class="w-full"
          :form="formRecord"
          :users="familyMembers"
          :options="userSelectorOptions"
          @update:selected-users="updateForm"
        />
      </n-form-item>

      <!-- Create Button -->
      <MlbButton
        v-if="isLargeScreen || $route.params.step == '2'"
        type="submit"
        :label="$route.params.id ? 'Update' : 'Create'"
        :loading="loading"
        :disabled="loading"
        :primary="true"
        class="w-full rounded-2xl! h-13!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useMessage,
  NForm,
  NFormItem,
  NInput,
  NUpload,
  NDatePicker,
  type UploadFileInfo,
} from 'naive-ui'
import type { FormInst } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { timeCapsuleValidation } from '@/validations/time-capsule.validations'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { useHome } from '@/composables/useHome'
import { useGeneralStore } from '@/stores/general.store'
import type { UserSelectorOptions } from '@/components/common/UserSelector.vue'
import UserSelector from '@/components/common/UserSelector.vue'
import {
  useCreateTimeCapsuleMutation,
  useUpdateTimeCapsuleMutation,
  useDeleteTimeCapsuleAttachmentMutation,
} from '@/services/time-capsule.services'
import { handleApiError } from '@/helpers/error.helpers'
import { useRoute, useRouter } from 'vue-router'
import { AlertService } from '@/services/alert.service'
import { useMediaQuery } from '@vueuse/core'
import { useTimeCapsuleStore } from '@/stores/time-capsule.store'
import { useTimeCapsule } from '@/composables/time-capsule.composables'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const generalStore = useGeneralStore()
const { fetchFamilyMembers } = useHome()
const { form, rules } = timeCapsuleValidation()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const createTimeCapsuleMutation = useCreateTimeCapsuleMutation()
const updateTimeCapsuleMutation = useUpdateTimeCapsuleMutation()
const timeCapsuleStore = useTimeCapsuleStore()
const { loading, capsule: selectedCapsule, fetchTimeCapsuleDetails } = useTimeCapsule()

const formRef = ref<FormInst | null>(null)
const uploadFileList = ref<UploadFileInfo[]>([])
const previousFileList = ref<UploadFileInfo[]>([])
const deleteAttachmentMutation = useDeleteTimeCapsuleAttachmentMutation()
const emit = defineEmits<{
  (e: 'submit', data: typeof form.value): void
  (e: 'close'): void
}>()

defineExpose({
  form,
})

const userSelectorOptions: UserSelectorOptions = {
  form_user_ids_field: 'family_member_ids',
  search_fields: ['first_name', 'middle_name', 'family_name'],
  avatar_field: 'profile_picture_url',
  name_fields: ['first_name', 'middle_name', 'family_name'],
}

const familyMembers = computed<FamilyMemberInterface[]>(() => generalStore.familyMembers)

const formRecord = computed<Record<string, unknown>>(
  () => form.value as unknown as Record<string, unknown>,
)

const toValidFiles = (fileList: UploadFileInfo[]) =>
  fileList.map((file) => file.file).filter((item): item is File => item instanceof File)

const handleFileListUpdate = async (fileList: UploadFileInfo[]) => {
  const deletedFiles = previousFileList.value.filter((prevFile) => {
    return !fileList.some((newFile) => {
      // If both have ids, compare by id
      if (prevFile.id && newFile.id) {
        return prevFile.id === newFile.id
      }
      // Otherwise, compare by url or name as fallback
      return prevFile.url === newFile.url || prevFile.name === newFile.name
    })
  })

  for (const deletedFile of deletedFiles) {
    if (deletedFile.id && typeof deletedFile.id === 'string') {
      const attachmentId = Number(deletedFile.id)
      if (!isNaN(attachmentId) && attachmentId > 0) {
        try {
          await deleteAttachmentMutation.mutateAsync({
            capsuleId: Number($route.params.id),
            attachmentId,
          })
        } catch (error) {
          handleApiError(error, message)
        }
      }
    }
  }

  // Update the file lists
  previousFileList.value = [...fileList]
  uploadFileList.value = fileList
  form.value.files = toValidFiles(fileList)
}

const updateForm = (value: number[]) => {
  form.value.family_member_ids = value
}

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }
    try {
      Number(selectedCapsule.value?.id) ? await updateTimeCapsule() : await handleCreation()

      AlertService.success({
        subject: selectedCapsule.value?.id ? 'Time Capsule Edited' : 'Time Capsule Created',
        showIcon: true,
        imageUrl: 'images/success.png',
        closable: true,
        closablePosition: 'left',
        showCancelButton: false,
        bottomSheet: !isLargeScreen.value,
        bottomSheetHeight: 256,
        closeText: 'Close',
      })
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

const handleCreation = async () => {
  loading.value = true
  try {
    await createTimeCapsuleMutation.mutateAsync(form.value)
    emit('submit', form.value)
    emit('close')
    $router.replace({ name: 'App.TimeCapsules.View' })
  } catch (error) {
    throw error
  } finally {
    loading.value = false
  }
}

const handleUpdate = async (password?: string) => {
  loading.value = true
  try {
    await updateTimeCapsuleMutation.mutateAsync({
      ...form.value,
      password,
      id: Number(selectedCapsule.value?.id),
    })
    emit('submit', form.value)
    emit('close')
    $router.replace({ name: 'App.TimeCapsules.View' })
  } catch (error) {
    throw error
  } finally {
    loading.value = false
  }
}

type AlertInputValues = Record<string, string>

const updateTimeCapsule = async () => {
  const result = (await AlertService.alert({
    subject: 'Enter Password to Edit',
    message:
      'We know that many things may happen but we hope that you always remember your new password',
    closable: true,
    closeText: 'Cancel',
    showIcon: false,
    bottomSheet: !isLargeScreen.value,
    bottomSheetHeight: 400,
    closablePosition: 'left',
    bottomSheetFooterClass: 'justify-center! mt-3!',
    inputs: [
      {
        type: 'password',
        name: 'password',
        label: 'Password',
        placeholder: 'Enter Password',
        required: true,
      },
    ],
    showCancelButton: false,
    showConfirmButton: true,
    confirmButtonText: 'Edit Details',
    customClass: {
      confirmButton: 'rounded-2xl! bg-primary-700! h-13! text-white!',
    },
  })) as AlertInputValues | undefined

  const password = result?.password
  if (password) {
    await handleUpdate(password)
  }
}

const formatDateForPicker = (dateString: string | undefined): string | undefined => {
  if (!dateString) return undefined
  try {
    // Parse the date string (handles ISO format, yyyy-MM-dd, etc.)
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) return undefined
    // Format as yyyy-MM-dd
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return undefined
  }
}

const getEditData = () => {
  const selectedTimeCapsule = selectedCapsule.value
  if (selectedTimeCapsule) {
    const formData = {
      title: selectedTimeCapsule.title,
      description: selectedTimeCapsule.description,
      open_at: formatDateForPicker(selectedTimeCapsule.open_at),
      family_member_ids:
        selectedTimeCapsule.family_members
          ?.filter(
            (member): member is Partial<FamilyMemberInterface> & { id: number } =>
              typeof member.id === 'number',
          )
          .map((member) => member.id) ?? [],
      files: [],
    }
    timeCapsuleStore.setStoreProp('timeCapsuleForm', formData)
    // Convert existing attachments to UploadFileInfo format for display
    const fileList = selectedTimeCapsule.attachments.map((attachment) => ({
      id: String(attachment.id),
      name: attachment.name,
      status: 'finished' as const,
      url: attachment.url,
      thumbnail: attachment.thumbnail || attachment.url,
    }))
    uploadFileList.value = fileList
    // Store the initial file list to track deletions
    previousFileList.value = [...fileList]
  }
}

onMounted(async () => {
  fetchFamilyMembers()
  if (Number($route.params.id)) {
    await fetchTimeCapsuleDetails()
    getEditData()
  }
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
