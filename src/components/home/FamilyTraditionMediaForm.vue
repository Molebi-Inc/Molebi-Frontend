<template>
  <div class="flex flex-col gap-6">
    <!-- Form -->
    <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-6 px-10">
      <n-tabs
        type="line"
        justify-content="space-evenly"
        animated
        v-model:value="activeTab"
        @update:value="onTabUpdate"
      >
        <n-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name" :tab="tab.label">
          <div v-if="!onlyMediaUpload">
            <n-form-item path="title" :show-require-mark="false" :show-feedback="false">
              <MlbInput
                id="title"
                v-model="formTitle"
                name="title"
                type="text"
                placeholder="Add a Title.."
                custom-class="w-full borderless title-input"
              />
            </n-form-item>
            <hr class="border-gray-200" />
            <n-form-item
              v-if="activeTab === 'file'"
              path="description"
              :show-require-mark="false"
              :show-feedback="false"
            >
              <n-input
                v-model:value="formDescription"
                type="textarea"
                placeholder="Add a Description..."
                rows="2"
                class="w-full borderless"
              />
            </n-form-item>
          </div>

          <n-form-item path="media" :show-require-mark="false" :show-feedback="false">
            <component :is="tab.component" class="w-full" @update:file-list="updateFileList" />
          </n-form-item>

          <n-form-item
            v-if="!onlyMediaUpload"
            path="event_date"
            :show-require-mark="false"
            :show-feedback="false"
          >
            <n-date-picker
              v-model:formatted-value="formEventDate"
              value-format="yyyy-MM-dd"
              type="date"
              class="w-full rounded-2xl!"
            />
          </n-form-item>
        </n-tab-pane>
      </n-tabs>

      <!-- Create Button -->
      <MlbButton
        type="submit"
        :label="loading ? 'Uploading...' : 'Create'"
        :loading="loading"
        :disabled="loading || isFormEmpty"
        :primary="true"
        class="w-full rounded-2xl! h-13!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, markRaw, computed } from 'vue'
import {
  useMessage,
  NForm,
  NFormItem,
  NInput,
  NTabs,
  NTabPane,
  NDatePicker,
  type UploadFileInfo,
} from 'naive-ui'
import type { FormInst } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbAudio from '@/components/ui/MlbAudio.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import { useArchive } from '@/composables/useArchive'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import type { CreateFilesValues } from '@/types/vault.types'
import MlbFileAttachment from '@/components/ui/MlbFileAttachment.vue'
import type { FamilyMediaFormValues } from '@/types/family-tradition.types'
import { createFilesValidation, familyMediaValidation } from '@/validations/dashboard.validations'

const message = useMessage()
const { fileUploading, handleFileCreation } = useArchive()

const props = withDefaults(
  defineProps<{
    onlyMediaUpload: boolean
  }>(),
  {
    onlyMediaUpload: false,
  },
)
const { form, rules } = props.onlyMediaUpload ? createFilesValidation() : familyMediaValidation()

const formRef = ref<FormInst | null>(null)

const loading = computed(() => fileUploading.value)

const isFormEmpty = computed(() => {
  if (props.onlyMediaUpload) {
    return (form.value as CreateFilesValues).files.length === 0
  } else {
    return (form.value as FamilyMediaFormValues).media.length === 0
  }
})

// Computed properties for type-safe form bindings when onlyMediaUpload is false
const formTitle = computed({
  get: () => (form.value as FamilyMediaFormValues).title,
  set: (value: string) => {
    ;(form.value as FamilyMediaFormValues).title = value
  },
})

const formDescription = computed({
  get: () => (form.value as FamilyMediaFormValues).description,
  set: (value: string | undefined) => {
    ;(form.value as FamilyMediaFormValues).description = value
  },
})

const formEventDate = computed({
  get: () => (form.value as FamilyMediaFormValues).event_date,
  set: (value: string | undefined) => {
    ;(form.value as FamilyMediaFormValues).event_date = value
  },
})

const tabs = ref([
  {
    name: 'file',
    label: 'Upload File',
    component: markRaw(MlbFileAttachment),
  },
  {
    name: 'audio',
    label: 'Record Audio',
    component: markRaw(MlbAudio),
  },
])

const activeTab = ref('file')
const $route = useRoute()
const $router = useRouter()
const emit = defineEmits<{
  (e: 'submit', data: typeof form.value): void
  (e: 'close'): void
}>()

const onTabUpdate = (value: string) => {
  $router.push({
    ...$route,
    query: {
      ...$route.query,
      tab: value,
    },
  })
}

const getValidFiles = (fileList: UploadFileInfo[]) =>
  fileList
    .map((file) => file.file)
    .filter((maybeFile): maybeFile is File => maybeFile instanceof File)

const updateFileList = (fileList: UploadFileInfo[]) => {
  if (props.onlyMediaUpload) {
    ;(form.value as CreateFilesValues).files = getValidFiles(fileList)
  } else {
    ;(form.value as FamilyMediaFormValues).media = getValidFiles(fileList)
  }
}

const onFormSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }
    try {
      const response = await handleFileCreation(
        form.value as CreateFilesValues | FamilyMediaFormValues,
      )
      message.success(response?.message || 'File uploaded successfully')
      clearForm()
      emit('submit', form.value)
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

const clearForm = () => {
  if (props.onlyMediaUpload) {
    ;(form.value as CreateFilesValues).files = []
  } else {
    ;(form.value as FamilyMediaFormValues) = {
      title: '',
      description: '',
      media: [],
      event_date: new Date().toISOString().split('T')[0],
    }
  }
}

watch(
  () => String($route.query.tab),
  (value) => {
    if (value) {
      activeTab.value = value as string
    }
  },
  { immediate: true },
)
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
