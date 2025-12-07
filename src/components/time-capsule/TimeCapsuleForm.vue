<template>
  <div class="flex flex-col gap-6">
    <!-- Form -->
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

      <!-- Upload Media -->
      <div>
        <n-upload
          list-type="image-card"
          :file-list="uploadFileList"
          @update:file-list="handleFileListUpdate"
        />
      </div>
      <div>
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
import { useCreateTimeCapsuleMutation } from '@/services/time-capsule.services'
import { handleApiError } from '@/helpers/error.helpers'
import {
  useGetTimeCapsuleByIdQuery,
  useUpdateTimeCapsuleMutation,
} from '@/services/time-capsule.services'
import { useRoute, useRouter } from 'vue-router'
import type { TimeCapsuleInterface } from '@/types/time-capsule.types'
import { AlertService } from '@/services/alert.service'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const generalStore = useGeneralStore()
const { fetchFamilyMembers } = useHome()
const { form, rules } = timeCapsuleValidation()
const createTimeCapsuleMutation = useCreateTimeCapsuleMutation()
const updateTimeCapsuleMutation = useUpdateTimeCapsuleMutation()
const getTimeCapsuleDetails = useGetTimeCapsuleByIdQuery(
  Number($route.params.id),
  !!Number($route.params.id),
)

const loading = ref<boolean>(false)
const formRef = ref<FormInst | null>(null)
const uploadFileList = ref<UploadFileInfo[]>([])
const capsule = ref<TimeCapsuleInterface | null>(null)

const userSelectorOptions: UserSelectorOptions = {
  form_user_ids_field: 'family_member_ids',
  search_fields: ['first_name', 'middle_name', 'family_name'],
  avatar_field: 'profile_picture_url',
  name_fields: ['first_name', 'middle_name', 'family_name'],
}

const familyMembers = computed<FamilyMemberInterface[]>(() => generalStore.familyMembers)

const toValidFiles = (fileList: UploadFileInfo[]) =>
  fileList.map((file) => file.file).filter((item): item is File => item instanceof File)

const handleFileListUpdate = (fileList: UploadFileInfo[]) => {
  uploadFileList.value = fileList
  form.value.files = toValidFiles(fileList)
}

const emit = defineEmits<{
  (e: 'submit', data: typeof form.value): void
  (e: 'close'): void
}>()

const updateForm = (value: number[]) => {
  form.value.family_member_ids = value
}

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }
    Number($route.params.id) ? await updateTimeCapsule() : await handleCreation()
  })
}

const handleCreation = async () => {
  loading.value = true
  try {
    const response = await createTimeCapsuleMutation.mutateAsync(form.value)
    message.success(response?.message || 'Time capsule created successfully')
    emit('submit', form.value)
    emit('close')
    $router.replace({ name: 'App.TimeCapsules.View' })
  } catch (error) {
    handleApiError(error, message)
  } finally {
    loading.value = false
  }
}

const handleUpdate = async (password?: string) => {
  loading.value = true
  try {
    const response = await updateTimeCapsuleMutation.mutateAsync({
      ...form.value,
      password,
      id: Number($route.params.id),
    })
    message.success(response?.message || 'Time capsule updated successfully')
    emit('submit', form.value)
    emit('close')
    $router.replace({ name: 'App.TimeCapsules.View' })
  } catch (error) {
    handleApiError(error, message)
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
    showIcon: false,
    closablePosition: 'left',
    inputs: [
      {
        type: 'password',
        name: 'password',
        label: 'Password',
        placeholder: 'Enter Password',
        required: true,
        validation: (value: string) => {
          if (!value) return 'Password is required'
          return null
        },
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

const fetchTimeCapsuleDetails = async () => {
  loading.value = true
  const response = await getTimeCapsuleDetails.refetch()
  capsule.value = response.data?.data as TimeCapsuleInterface | null
  loading.value = false
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
  const selectedTimeCapsule = capsule.value
  if (selectedTimeCapsule) {
    form.value = {
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
      files: [], // Existing attachments are already on server, files array is for new uploads only
    }
    // Convert existing attachments to UploadFileInfo format for display
    uploadFileList.value = selectedTimeCapsule.attachments.map((attachment) => ({
      id: String(attachment.id),
      name: attachment.name,
      status: 'finished' as const,
      url: attachment.url,
      thumbnail: attachment.thumbnail || attachment.url,
    }))
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
</style>
