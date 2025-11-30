<template>
  <section>
    <div v-if="foldersLoading">
      <SkeletalLoader :rows="2" :columns="isLargeScreen ? 5 : 2" :gap="4" height="160px" />
    </div>
    <div v-else class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <FolderCard
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        @select:option="$emit('select:option', $event)"
        @click="$emit('click')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FolderInterface } from '@/types/vault.types'
import type { StorageFolderInterface } from '@/types/storage.types'
import FolderCard from '@/components/vault/FolderCard.vue'
import SkeletalLoader from '@/components/common/SkeletalLoader.vue'
import { useStorageStore } from '@/stores/storage.store'
import { useMediaQuery } from '@vueuse/core'

const storageStore = useStorageStore()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const foldersLoading = computed(() => storageStore.foldersLoading)

defineProps<{
  folders: FolderInterface[]
}>()

const $emit = defineEmits<{
  (
    e: 'select:option',
    value: { key: string; folder: FolderInterface | StorageFolderInterface | null },
  ): void
  (e: 'click'): void
}>()
</script>
