<template>
  <n-tabs
    type="line"
    justify-content="space-evenly"
    animated
    v-model:value="activeTab"
    @update:value="onTabUpdate"
  >
    <n-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name" :tab="tab.label">
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
            <n-form-item
              v-if="activeTab === 'file'"
              path="description"
              :show-require-mark="false"
              :show-feedback="false"
            >
              <n-input
                v-model:value="form.description"
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

          <!-- Create Button -->
          <MlbButton
            type="submit"
            label="Create"
            :primary="true"
            class="w-full rounded-2xl! h-13!"
            @click="onFormSubmit"
          />
        </n-form>
      </div>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  useMessage,
  NForm,
  NFormItem,
  NInput,
  NTabs,
  NTabPane,
  type UploadFileInfo,
} from 'naive-ui'
import type { FormInst } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { familyMediaValidation } from '@/validations/dashboard.validations'
import MlbFileAttachment from '@/components/ui/MlbFileAttachment.vue'
import MlbAudio from '@/components/ui/MlbAudio.vue'
import { useRoute, useRouter } from 'vue-router'

const { form, rules } = familyMediaValidation()
const message = useMessage()
const formRef = ref<FormInst | null>(null)

const tabs = ref([
  {
    name: 'file',
    label: 'Upload File',
    component: MlbFileAttachment,
  },
  {
    name: 'audio',
    label: 'Upload Audio',
    component: MlbAudio,
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
  form.value.media = getValidFiles(fileList)
}

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }

    emit('submit', form.value)
    message.success('Announcement created successfully!')
  })
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
</style>
