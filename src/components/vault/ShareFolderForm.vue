<template>
  <div class="share-folder-form px-6 pb-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Share Folder</h1>
      <p class="text-sm text-gray-600">Share your folder with family members</p>
      <div class="border-t border-gray-200 mt-4"></div>
    </div>

    <!-- Folder Information -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
        <img
          src="@/assets/images/folder-filled.png"
          alt="filled folder"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-base font-semibold text-gray-900 truncate">
          {{ folder?.name || 'Folder' }}
        </h2>
        <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <span>{{ folder?.total_files ?? 0 }} Media</span>
          <span v-if="(folder?.total_size ?? 0) > 0" class="flex items-center gap-2">
            <span class="w-1 h-1 bg-red-500 rounded-full"></span>
            <span>{{ formatFileSize(folder?.total_size ?? 0) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Sharable Link Option -->
    <div class="bg-secondary-50 rounded-xl p-4 mb-6">
      <h3 class="text-sm font-semibold text-gray-900 mb-1">Invite members via a sharable link</h3>
      <p class="text-xs text-gray-600">Anyone with the link can view</p>
    </div>

    <!-- Tabs -->
    <!-- <div class="flex gap-6 mb-4 border-b border-gray-200">
      <button
        @click="activeTab = 'individual'"
        :class="[
          'pb-3 text-sm font-medium transition-colors',
          activeTab === 'individual'
            ? 'text-gray-900 border-b-2 border-primary-500'
            : 'text-gray-400',
        ]"
      >
        Individual
      </button>
      <button
        @click="activeTab = 'family'"
        :class="[
          'pb-3 text-sm font-medium transition-colors',
          activeTab === 'family' ? 'text-gray-900 border-b-2 border-primary-500' : 'text-gray-400',
        ]"
      >
        Family
      </button>
    </div> -->

    <n-form ref="formRef" :model="form" :rules="rules">
      <!-- Search Input -->
      <UserSelector
        label="Family Members"
        :form="form"
        :users="familyMembers"
        :options="userSelectorOptions"
        @update:selected-users="updateForm"
      />
      <div v-if="form.family_member_id.length > 0" class="mt-3 grid grid-cols-3 items-center gap-2">
        <div class="col-span-2 text-sm font-medium text-gray-500">
          {{
            form.family_member_id.length > 1
              ? `${form.family_member_id.length} members`
              : `${form.family_member_id.length} member`
          }}
        </div>
        <n-select
          v-model:value="form.permission"
          :options="permissions"
          size="tiny"
          class="col-span-1 justify-self-end"
        />
      </div>
    </n-form>
    <!-- <div class="mb-4">
      <MlbInput
        v-model="searchQuery"
        type="text"
        placeholder="Search name"
        custom-class="border-gray-300 focus:border-primary-500"
      />
    </div>

    <div class="mb-6 max-h-[300px] overflow-y-auto">
      <div
        v-for="member in filteredMembers"
        :key="member.id"
        @click="toggleMemberSelection(member.id)"
        :class="[
          'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-2',
          selectedMembers.has(member.id) ? 'bg-gray-100' : 'bg-white hover:bg-gray-50',
        ]"
      >
        <div class="w-10 h-10 rounded-full overflow-hidden shrink-0">
          <img
            v-if="member.profile_picture_url || member.avatar_url"
            :src="member.profile_picture_url || member.avatar_url"
            :alt="getMemberName(member)"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold"
          >
            {{ getMemberInitials(member) }}
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ getMemberName(member) }}
          </p>
          <p v-if="member.email" class="text-xs text-gray-500 truncate">
            {{ member.email }}
          </p>
        </div>
        <div
          v-if="selectedMembers.has(member.id)"
          class="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0"
        >
          <MlbIcon name="vuesax.linear.tick-circle" :size="16" color="#ffffff" />
        </div>
      </div>

      <div v-if="filteredMembers.length === 0" class="text-center py-8 text-gray-500 text-sm">
        No members found
      </div>
    </div> -->

    <!-- Action Buttons -->
    <div class="flex gap-3 mt-6">
      <MlbButton
        class="flex-1 rounded-xl! bg-primary-700! h-12! text-white! font-medium!"
        :loading="loading"
        :disabled="form.family_member_id.length === 0 || loading"
        @click="handleShare"
      >
        Share
      </MlbButton>
      <MlbButton
        class="rounded-xl! bg-primary-50! h-12! text-primary-700! font-medium! px-4!"
        :loading="loading"
        :disabled="loading"
        @click="handleCopyLink"
      >
        <template #icon>
          <MlbIcon name="link" :size="20" color="#0F4C3F" />
        </template>
        <span class="ml-2">Copy Link</span>
      </MlbButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import UserSelector from '@/components/common/UserSelector.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import type { FolderInterface } from '@/types/vault.types'
import type { StorageFolderInterface } from '@/types/storage.types'
import { useMessage, type FormInst } from 'naive-ui'
import { shareFolderFormValidation } from '@/validations/storage.validations'
import { useHome } from '@/composables/useHome'
import type { UserSelectorOptions } from '@/components/common/UserSelector.vue'
import { useShareFolderMutation } from '@/services/storage.services'
import { handleApiError } from '@/helpers/error.helpers'
import { formatFileSize } from '@/helpers/general.helpers'
import { useGeneralStore } from '@/stores/general.store'
import type { SelectOption } from 'naive-ui'
import { NForm, NSelect } from 'naive-ui'

interface Props {
  folder?: StorageFolderInterface | null
  // folder?: FolderInterface | StorageFolderInterface | null
  shareableLink?: string
  folderSize?: number // Folder size in bytes
}

const props = withDefaults(defineProps<Props>(), {
  folder: null,
  shareableLink: '',
  folderSize: 0,
})

const emit = defineEmits<{
  (e: 'share'): void
  (e: 'copy-link'): void
}>()

const message = useMessage()
const generalStore = useGeneralStore()
const { fetchFamilyMembers } = useHome()
const { form, rules } = shareFolderFormValidation()
const shareFolderMutation = useShareFolderMutation()

const loading = ref<boolean>(false)
// const activeTab = ref<'individual' | 'family'>('individual')

const formRef = ref<FormInst | null>(null)
const userSelectorOptions: UserSelectorOptions = {
  form_user_ids_field: 'family_member_id',
  search_fields: ['first_name', 'middle_name', 'family_name'],
  avatar_field: 'profile_picture_url',
  name_fields: ['first_name', 'middle_name', 'family_name'],
}

const familyMembers = computed<FamilyMemberInterface[]>(() => generalStore.familyMembers)

const permissions = ref<SelectOption[]>([
  {
    label: 'Can View',
    value: 'view',
  },
  {
    label: 'Can Edit',
    value: 'edit',
  },
  {
    label: 'Can Delete',
    value: 'delete',
  },
])

const handleShare = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }
    loading.value = true
    try {
      const response = await shareFolderMutation.mutateAsync({
        id: props.folder?.id ?? 0,
        data: form.value,
      })

      message.success(response.message ?? 'Folder shared successfully')
      emit('share')
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = false
    }
  })
}

const updateForm = (value: number[]) => {
  form.value.family_member_id = value
}

// Handle copy link action
const handleCopyLink = async () => {
  const link = props.shareableLink || window.location.href

  try {
    await navigator.clipboard.writeText(link)
    message.success('Link copied to clipboard')
    emit('copy-link')
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = link
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      message.success('Link copied to clipboard')
      emit('copy-link')
    } catch {
      message.error('Failed to copy link')
    }
    document.body.removeChild(textArea)
  }
}

onMounted(() => {
  fetchFamilyMembers()
})
</script>

<style scoped>
/* Custom scrollbar for members list */
.max-h-\[300px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[300px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.max-h-\[300px\]::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.max-h-\[300px\]::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
