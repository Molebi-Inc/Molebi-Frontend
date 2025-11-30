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
          {{ folder?.title || 'Folder' }}
        </h2>
        <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <span>{{ (folder?.attachments?.length ?? 0) }} Media</span>
          <span v-if="props.folderSize > 0" class="flex items-center gap-2">
            <span class="w-1 h-1 bg-red-500 rounded-full"></span>
            <span>{{ formatFileSize(props.folderSize ?? 0) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Sharable Link Option -->
    <div class="bg-orange-50 rounded-xl p-4 mb-6">
      <h3 class="text-sm font-semibold text-gray-900 mb-1">Invite members via a sharable link</h3>
      <p class="text-xs text-gray-600">Anyone with the link can view</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-6 mb-4 border-b border-gray-200">
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
    </div>

    <!-- Search Input -->
    <div class="mb-4">
      <MlbInput
        v-model="searchQuery"
        type="text"
        placeholder="Search name"
        custom-class="border-gray-300 focus:border-primary-500"
      />
    </div>

    <!-- Members List -->
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
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <MlbButton
        @click="handleShare"
        :loading="loading"
        :disabled="selectedMembers.size === 0"
        class="flex-1 rounded-xl! bg-primary-700! h-12! text-white! font-medium!"
      >
        Share
      </MlbButton>
      <MlbButton
        @click="handleCopyLink"
        class="rounded-xl! bg-primary-50! h-12! text-primary-700! font-medium! px-4!"
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
import { ref, computed } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import type { FolderInterface } from '@/types/vault.types'
import { useMessage } from 'naive-ui'

interface Props {
  folder?: FolderInterface | null
  familyMembers?: FamilyMemberInterface[]
  individualMembers?: FamilyMemberInterface[]
  shareableLink?: string
  folderSize?: number // Folder size in bytes
}

const props = withDefaults(defineProps<Props>(), {
  folder: null,
  familyMembers: () => [],
  individualMembers: () => [],
  shareableLink: '',
  folderSize: 0,
})

const emit = defineEmits<{
  (e: 'share', members: number[]): void
  (e: 'copy-link'): void
}>()

const message = useMessage()
const activeTab = ref<'individual' | 'family'>('individual')
const searchQuery = ref('')
const selectedMembers = ref<Set<number>>(new Set())
const loading = ref(false)

// Get members based on active tab
const currentMembers = computed(() => {
  return activeTab.value === 'family' ? props.familyMembers : props.individualMembers
})

// Filter members based on search query
const filteredMembers = computed(() => {
  if (!searchQuery.value.trim()) {
    return currentMembers.value
  }

  const query = searchQuery.value.toLowerCase()
  return currentMembers.value.filter((member) => {
    const name = getMemberName(member).toLowerCase()
    const email = (member.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

// Get member display name
const getMemberName = (member: FamilyMemberInterface): string => {
  if (member.name) return member.name
  if (member.full_name) return member.full_name
  return `${member.first_name} ${member.family_name}`.trim()
}

// Get member initials for avatar fallback
const getMemberInitials = (member: FamilyMemberInterface): string => {
  const firstName = member.first_name?.[0] || ''
  const familyName = member.family_name?.[0] || ''
  return `${firstName}${familyName}`.toUpperCase() || '?'
}

// Toggle member selection
const toggleMemberSelection = (memberId: number) => {
  if (selectedMembers.value.has(memberId)) {
    selectedMembers.value.delete(memberId)
  } else {
    selectedMembers.value.add(memberId)
  }
}

// Handle share action
const handleShare = async () => {
  if (selectedMembers.value.size === 0) {
    message.warning('Please select at least one member to share with')
    return
  }

  loading.value = true
  try {
    emit('share', Array.from(selectedMembers.value))
    message.success('Folder shared successfully')
  } catch {
    message.error('Failed to share folder')
  } finally {
    loading.value = false
  }
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

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
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
