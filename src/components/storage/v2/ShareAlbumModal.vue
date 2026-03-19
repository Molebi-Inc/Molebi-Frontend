<template>
  <MlbModal
    :show="show"
    :bottom-sheet="isMobile"
    :bottom-sheet-height="560"
    @update:show="$emit('update:show', $event)"
  >
    <div class="flex flex-col gap-4 py-1">
      <!-- Header -->
      <div>
        <h3 class="text-base font-semibold text-neutral-900">{{ albumName }}</h3>
        <p class="text-xs text-neutral-400 mt-0.5">Share your memory with family members</p>
      </div>

      <!-- Shareable link row -->
      <div class="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
        <svg class="text-neutral-500 flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 6L14 2M14 2H10M14 2V6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M7 3H3C2.4 3 2 3.4 2 4V13C2 13.6 2.4 14 3 14H12C12.6 14 13 13.6 13 13V9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-neutral-800">Invite members via a sharable link</p>
          <p class="text-[11px] text-neutral-400 mt-0.5">Anyone with the link can view, comment and like</p>
        </div>
      </div>

      <!-- Individual / Family tabs -->
      <div class="flex border-b border-neutral-200">
        <button
          v-for="tab in ['Individual', 'Family'] as const"
          :key="tab"
          class="flex-1 py-2 text-sm font-medium transition-colors relative"
          :class="activeTab === tab ? 'text-primary-700' : 'text-neutral-500 hover:text-neutral-700'"
          @click="activeTab = tab"
        >
          {{ tab }}
          <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700 rounded-full" />
        </button>
      </div>

      <!-- Member picker -->
      <FamilyMemberPicker :selected="selectedIds" @toggle="toggleMember" />

      <!-- Selected members section -->
      <div v-if="selectedIds.length" class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-neutral-700">{{ selectedIds.length }} member{{ selectedIds.length !== 1 ? 's' : '' }}</span>
          <!-- Permission dropdown -->
          <div class="relative">
            <button
              class="flex items-center gap-1 text-xs font-medium text-neutral-700 border border-neutral-200 rounded-lg px-2.5 py-1.5 hover:bg-neutral-50 transition-colors"
              @click="showPermission = !showPermission"
            >
              {{ permissionLabel }}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" :class="showPermission ? 'rotate-180' : ''" class="transition-transform">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div v-if="showPermission" class="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 overflow-hidden w-36">
              <button
                v-for="opt in permissionOptions"
                :key="opt.value"
                class="w-full text-left px-3 py-2.5 text-xs hover:bg-neutral-50 transition-colors"
                :class="permission === opt.value ? 'text-primary-700 font-semibold' : 'text-neutral-700'"
                @click="permission = opt.value; showPermission = false"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Selected member chips -->
        <div class="flex flex-col gap-1 max-h-[120px] overflow-y-auto">
          <div
            v-for="memberId in selectedIds"
            :key="memberId"
            class="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-xl"
          >
            <div class="w-7 h-7 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
              <img v-if="getMember(memberId)?.profile_picture_url" :src="getMember(memberId)!.profile_picture_url!" class="w-full h-full object-cover" />
              <span v-else class="text-[10px] font-semibold text-neutral-500 uppercase">
                {{ (getMember(memberId)?.first_name?.[0] ?? '') + (getMember(memberId)?.family_name?.[0] ?? '') }}
              </span>
            </div>
            <span class="flex-1 text-xs font-medium text-neutral-800 truncate">{{ getMember(memberId)?.full_name }}</span>
            <button class="text-neutral-400 hover:text-neutral-700 transition-colors" @click="removeSelected(memberId)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3">
        <button
          class="flex-1 py-3 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
          :disabled="selectedIds.length === 0 || loading"
          @click="handleShare"
        >
          {{ loading ? 'Sharing…' : 'Share' }}
        </button>
        <button
          class="flex-1 py-3 rounded-2xl border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
          :disabled="copyLoading"
          @click="handleCopyLink"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M9 6L13 2M13 2H9M13 2V6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6.5 2.5H3C2.4 2.5 2 2.9 2 3.5V12C2 12.6 2.4 13 3 13H11.5C12.1 13 12.5 12.6 12.5 12V8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
          {{ copyLoading ? 'Generating…' : copied ? 'Copied!' : 'Copy Link' }}
        </button>
      </div>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import FamilyMemberPicker from '@/components/shared/media/FamilyMemberPicker.vue'
import { useGeneralStore } from '@/stores/general.store'
import { useShareFolderMutation, useGenerateShareableLinkMutation } from '@/services/storage.services'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import type { ShareFolderFormValues } from '@/types/storage.types'

const props = defineProps<{
  show: boolean
  albumName: string
  albumId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'shared'): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const message = useMessage()
const generalStore = useGeneralStore()
const shareMutation = useShareFolderMutation()
const generateLinkMutation = useGenerateShareableLinkMutation()

const activeTab = ref<'Individual' | 'Family'>('Individual')
const selectedIds = ref<number[]>([])
const permission = ref<ShareFolderFormValues['permission']>('view')
const showPermission = ref(false)
const copied = ref(false)
const copyLoading = ref(false)
const loading = computed(() => shareMutation.isPending.value)

const permissionOptions = [
  { label: 'View only', value: 'view' as const },
  { label: 'Can edit', value: 'edit' as const },
  { label: 'Full access', value: 'manage' as const },
]
const permissionLabel = computed(
  () => permissionOptions.find((o) => o.value === permission.value)?.label ?? 'View only',
)

const members = computed(() => generalStore.familyMembers as FamilyMemberInterface[])

const getMember = (id: number) => members.value.find((m) => m.id === id)

const toggleMember = (id: number) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value = [...selectedIds.value, id]
  else selectedIds.value = selectedIds.value.filter((i) => i !== id)
}

const removeSelected = (id: number) => {
  selectedIds.value = selectedIds.value.filter((i) => i !== id)
}

const handleShare = async () => {
  if (!props.albumId || !selectedIds.value.length) return
  try {
    await shareMutation.mutateAsync({
      id: props.albumId,
      data: { family_member_ids: selectedIds.value, permission: permission.value },
    })
    message.success('Album shared successfully')
    selectedIds.value = []
    emit('shared')
    emit('update:show', false)
  } catch {
    message.error('Failed to share album')
  }
}

const handleCopyLink = async () => {
  if (!props.albumId) return
  copyLoading.value = true
  try {
    const res = await generateLinkMutation.mutateAsync({ id: props.albumId })
    await navigator.clipboard.writeText(res.data.share_link)
    copied.value = true
    setTimeout(() => (copied.value = false), 3000)
    message.success('Link copied to clipboard')
  } catch {
    message.error('Failed to generate link')
  } finally {
    copyLoading.value = false
  }
}
</script>
