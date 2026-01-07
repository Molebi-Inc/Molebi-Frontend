<template>
  <div class="md:px-10">
    <n-form ref="formRef" :label-width="80" :model="form" :rules="rules">
      <div class="flex flex-col gap-1 mb-11">
        <n-form-item
          v-if="currentFlow === 'storage'"
          path="name"
          :show-require-mark="false"
          :show-feedback="false"
        >
          <MlbInput
            id="name"
            v-model="form.name"
            name="name"
            type="text"
            placeholder="Folder Name"
            custom-class="w-full borderless title-input"
          />
        </n-form-item>
        <n-form-item v-else path="title" :show-require-mark="false" :show-feedback="false">
          <MlbInput
            id="title"
            v-model="form.title"
            name="title"
            type="text"
            placeholder="Folder Title"
            custom-class="w-full borderless title-input"
          />
        </n-form-item>
      </div>
      <MlbButton
        type="submit"
        :label="!isLargeScreen ? 'Proceed' : archiveExist ? 'Update' : 'Create'"
        :loading="loading"
        :disabled="loading || (currentFlow === 'storage' ? !form.name : !form.title)"
        block
        class="rounded-2xl! bg-primary-700! h-13! text-white!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { useMediaQuery } from '@vueuse/core'
import { ref, onMounted, computed } from 'vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import { useVaultStore } from '@/stores/vault.store'
import { useArchive } from '@/composables/useArchive'
import MlbButton from '@/components/ui/MlbButton.vue'
import { NForm, NFormItem, useMessage } from 'naive-ui'
import { handleApiError } from '@/helpers/error.helpers'
import { useStorageStore } from '@/stores/storage.store'
import type { FolderInterface } from '@/types/vault.types'
import type { StorageFolderInterface } from '@/types/storage.types'
import { createFolderValidation } from '@/validations/vault.validations'
import { useRoute } from 'vue-router'

const message = useMessage()
const vaultStore = useVaultStore()
const storageStore = useStorageStore()
const { form, rules } = createFolderValidation()
const { currentFlow, archiveExist } = useArchive()
const { loading, handleArchiveMutation, setSelectedFolder } = useArchive()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const $emit = defineEmits<{
  (
    e: 'update:folder',
    payload: { key: string; folder?: FolderInterface | StorageFolderInterface | null },
  ): void
}>()

const formRef = ref<FormInst | null>(null)

const selectedFolder = computed<FolderInterface | StorageFolderInterface | null>(
  () => vaultStore.selectedFolder || storageStore.selectedFolder,
)

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      const response = await handleArchiveMutation(form.value)
      if (response) {
        // message.success(response?.message || 'Folder created successfully')
        message.success('Folder created successfully')
        vaultStore.setStoreProp('selectedFolder', response.data || null)
        $emit('update:folder', {
          key: response.key,
          folder: selectedFolder.value,
        })
      }
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

const getEditData = () => {
  if (selectedFolder.value) {
    form.value = {
      name:
        currentFlow.value === 'storage'
          ? (selectedFolder.value as StorageFolderInterface).name
          : undefined,
      title:
        currentFlow.value === 'vault' ? (selectedFolder.value as FolderInterface).title : undefined,
    }
  }
}

onMounted(() => {
  if (!vaultStore.edit) {
    setSelectedFolder(null)
  }
  // if ($route.params.id) {
  getEditData()
  //   return
  // }
})
</script>

<style scoped>
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
