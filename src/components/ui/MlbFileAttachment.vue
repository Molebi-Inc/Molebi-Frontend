<template>
  <n-form-item path="media" :show-require-mark="false" :show-feedback="false">
    <div>
      <n-upload
        v-if="!previewFileList.length"
        multiple
        directory-dnd
        action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
        :max="5"
        @update:file-list="updateFileList"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3" class="bg-white!">
              <MlbIcon name="vuesax.linear.cloud-plus" />
            </n-icon>
          </div>
          <n-text style="font-size: 16px"> Browse or drag a file here </n-text>
          <n-p depth="3" style="margin: 8px 0 0 0"> Maximum file 2MB </n-p>
        </n-upload-dragger>
      </n-upload>
      <n-upload
        v-else
        action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
        :default-file-list="previewFileList"
        list-type="image-card"
        @update:file-list="updateFileList"
      />
    </div>
  </n-form-item>
</template>

<script setup lang="ts">
import { NUpload, NUploadDragger, NIcon, NText, NP, type UploadFileInfo, NFormItem } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'update:file-list', fileList: UploadFileInfo[]): void
}>()

const previewFileList = ref<UploadFileInfo[]>([])

const updateFileList = (fileList: UploadFileInfo[]) => {
  previewFileList.value = fileList
  emit('update:file-list', fileList)
}
</script>

<style scoped>
.n-upload-dragger {
  @reference border-2 border-dashed border-gray-300 rounded-md p-4;
}
:deep(.n-form-item-blank div) {
  width: 100%;
}
</style>
