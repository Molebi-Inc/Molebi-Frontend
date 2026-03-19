<template>
  <MlbModal
    :show="show"
    :bottom-sheet="isMobile"
    :bottom-sheet-height="500"
    @update:show="$emit('update:show', $event)"
  >
    <div class="flex flex-col gap-4 py-1">
      <!-- Header -->
      <div>
        <h3 class="text-base font-semibold text-neutral-900">{{ albumName }}</h3>
        <p class="text-xs text-neutral-400 mt-0.5">Tag family members to this memory</p>
      </div>

      <!-- Member picker -->
      <FamilyMemberPicker :selected="selectedIds" @toggle="toggleMember" />

      <!-- Tag button -->
      <button
        class="w-full py-3.5 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
        :disabled="selectedIds.length === 0 || loading"
        @click="handleTag"
      >
        {{ loading ? 'Tagging…' : 'Tag' }}
      </button>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import FamilyMemberPicker from '@/components/shared/media/FamilyMemberPicker.vue'
import { useShareFolderMutation } from '@/services/storage.services'

const props = defineProps<{
  show: boolean
  albumName: string
  albumId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'tagged'): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const message = useMessage()
const shareMutation = useShareFolderMutation()

const selectedIds = ref<number[]>([])
const loading = computed(() => shareMutation.isPending.value)

const toggleMember = (id: number) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value = [...selectedIds.value, id]
  else selectedIds.value = selectedIds.value.filter((i) => i !== id)
}

const handleTag = async () => {
  if (!props.albumId || !selectedIds.value.length) return
  try {
    await shareMutation.mutateAsync({
      id: props.albumId,
      data: { family_member_ids: selectedIds.value, permission: 'view' },
    })
    message.success('Family members tagged successfully')
    selectedIds.value = []
    emit('tagged')
    emit('update:show', false)
  } catch {
    message.error('Failed to tag members')
  }
}
</script>
