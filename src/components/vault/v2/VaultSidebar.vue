<template>
  <aside
    class="w-[280px] flex-shrink-0 bg-white rounded-3xl p-5 space-y-1 self-start shadow-sm border border-neutral-100"
  >
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors text-left"
      :class="
        active === item.id
          ? 'bg-[#E8F5E9] text-[#1B5E20]'
          : 'text-neutral-700 hover:bg-neutral-50'
      "
      @click="$emit('select', item.id)"
    >
      <MlbIcon :name="item.icon" :size="18" />
      {{ item.label }}
    </button>
  </aside>
</template>

<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'

export type VaultNavId = 'all' | 'folders' | 'files' | 'shared' | 'recent' | 'settings'

defineProps<{
  active: VaultNavId
}>()

defineEmits<{
  (e: 'select', id: VaultNavId): void
}>()

const items: { id: VaultNavId; label: string; icon: string }[] = [
  { id: 'all', label: 'All vault item', icon: 'vuesax.outline.image' },
  { id: 'folders', label: 'Folders', icon: 'vuesax.outline.folder-2' },
  { id: 'files', label: 'Files', icon: 'vuesax.outline.document-text' },
  { id: 'shared', label: 'Shared with me', icon: 'vuesax.outline.profile-2user' },
  { id: 'recent', label: 'Recent', icon: 'vuesax.outline.clock' },
  { id: 'settings', label: 'Vault Settings', icon: 'vuesax.outline.setting-2' },
]
</script>
