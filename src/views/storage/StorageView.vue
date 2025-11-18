<template>
  <section class="h-full overflow-auto">
    <div class="p-8">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-8">Upload Files to Storage</h1>

          <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-6">
            <n-form-item label="Name" path="name" :show-require-mark="false">
              <MlbInput
                v-model="form.name"
                id="name"
                name="name"
                type="text"
                placeholder="Enter storage name"
                custom-class="border-gray-300 focus:border-primary-500"
              />
            </n-form-item>

            <n-form-item label="Description" path="description" :show-require-mark="false">
              <n-input
                v-model:value="form.description"
                type="textarea"
                placeholder="Enter description (optional)"
                :rows="4"
                class="w-full"
              />
            </n-form-item>

            <n-form-item label="Files" path="files" :show-require-mark="false">
              <MlbFileAttachment @update:file-list="updateFileList" />
            </n-form-item>

            <MlbButton
              type="submit"
              :label="loading ? 'Uploading...' : 'Upload Files'"
              :loading="loading"
              :disabled="loading"
              :primary="true"
              block
              class="rounded-2xl! bg-primary-700! h-13! text-white! mt-4"
              @click="onFormSubmit"
            />
          </n-form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInst } from 'naive-ui'
import { NForm, NFormItem, NInput, useMessage, type UploadFileInfo } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbFileAttachment from '@/components/ui/MlbFileAttachment.vue'
import { storageValidation } from '@/validations/dashboard.validations'
import { handleApiError } from '@/helpers/error.helpers'

const message = useMessage()
const { form, rules } = storageValidation()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const updateFileList = (fileList: UploadFileInfo[]) => {
  form.value.files = fileList.map((file) => file.file as File).filter(Boolean)
}

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }

    loading.value = true
    try {
      // TODO: Implement storage upload API call
      // const response = await storageMutation.mutateAsync(form.value)

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000))

      message.success('Files uploaded successfully!')

      // Reset form
      form.value.name = ''
      form.value.description = ''
      form.value.files = []
      formRef.value?.restoreValidation()
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
:deep(.n-form-item-label) {
  font-weight: 500;
  color: #374151;
}
</style>
