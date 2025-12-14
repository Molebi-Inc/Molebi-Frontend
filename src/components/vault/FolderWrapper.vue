<template>
  <section>
    <div v-if="foldersLoading">
      <SkeletalLoader :rows="2" :columns="isLargeScreen ? 5 : 1" :gap="4" height="160px" />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <FolderCard
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :heritageVault="heritageVault"
        @select:option="$emit('select:option', $event)"
        @click:folder="$emit('click:folder', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { useArchive } from '@/composables/useArchive'
import type { FolderInterface } from '@/types/vault.types'
import FolderCard from '@/components/vault/FolderCard.vue'
import type { StorageFolderInterface } from '@/types/storage.types'
import SkeletalLoader from '@/components/common/SkeletalLoader.vue'

const { foldersLoading } = useArchive()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

defineProps<{
  folders: FolderInterface[] | StorageFolderInterface[]
  heritageVault?: boolean
}>()

const $emit = defineEmits<{
  (
    e: 'select:option',
    value: { key: string; folder: FolderInterface | StorageFolderInterface | null },
  ): void
  (e: 'click:folder', value: { flow: string; id?: number }): void
}>()
</script>
