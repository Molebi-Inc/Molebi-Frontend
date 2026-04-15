<template>
  <button
    type="button"
    class="relative text-left rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow w-full"
    @click="$emit('open', item)"
  >
    <div class="absolute top-2 right-2 z-10">
      <n-dropdown :options="menuOptions" @select="onMenuSelect">
        <n-button text type="tertiary" @click.stop.prevent>
          <MlbIcon name="vuesax.linear.more" :size="18" color="#9CA3AF" />
        </n-button>
      </n-dropdown>
    </div>
    <div
      class="aspect-[4/3] rounded-xl bg-neutral-100 overflow-hidden mb-2 flex items-center justify-center"
    >
      <img
        v-if="isImage && previewUrl"
        :src="previewUrl"
        :alt="item.attachment.file_name"
        class="w-full h-full object-cover"
      />
      <div v-else-if="isPdf" class="flex flex-col items-center justify-center gap-1 py-4 text-neutral-500">
        <span class="text-xs font-bold uppercase tracking-wide text-red-600">PDF</span>
        <MlbIcon name="vuesax.outline.document-text" :size="32" color="#9CA3AF" />
      </div>
      <MlbIcon v-else name="vuesax.outline.document-text" :size="36" color="#9CA3AF" />
    </div>
    <p class="text-sm font-semibold text-neutral-900 truncate pr-6">{{ displayName }}</p>
    <p class="text-xs text-neutral-500 mt-1">Last modified {{ modifiedLabel }}</p>
  </button>
</template>

<script setup lang="ts">
import { h, computed } from 'vue'
import { NButton, NDropdown } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import type { AttachmentInterface } from '@/types/vault.types'

export type VaultFileRow = {
  attachment: AttachmentInterface
  folderTitle: string
  folderId: number
}

const props = defineProps<{
  item: VaultFileRow
}>()

const emit = defineEmits<{
  (e: 'open', row: VaultFileRow): void
}>()

const displayName = computed(
  () => props.item.attachment.title || props.item.attachment.file_name || 'Untitled',
)

const isImage = computed(() => props.item.attachment.mime_type?.startsWith('image/'))

const isPdf = computed(() => props.item.attachment.mime_type?.includes('pdf'))

const previewUrl = computed(
  () => props.item.attachment.thumbnail || props.item.attachment.url || null,
)

const modifiedLabel = computed(() => {
  const d = props.item.attachment.date
  if (!d) return '—'
  const x = new Date(d)
  return x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
})

const menuOptions = [
  {
    label: 'Open',
    key: 'open',
    icon: () => h(MlbIcon, { name: 'vuesax.linear.eye', size: 12, color: '#737373' }),
  },
]

const onMenuSelect = (key: string) => {
  if (key === 'open') emit('open', props.item)
}
</script>
