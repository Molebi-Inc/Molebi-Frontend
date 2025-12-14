<template>
  <section>
    <div>
      <BackButton
        icon="vuesax.linear.arrow-left"
        :previous-route="false"
        @update:go-back="handleGalleryBack"
      />
      <div>
        {{  }}
      </div>
    </div>
    <GalleryComponent
      :media="gallery"
      :items-per-row="6"
      media-type="all"
      layout="grid"
      :item-size="165"
      :show-info="false"
      :is-loading="folderMediaLoading"
      :allow-batch-action="true"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVaultStore } from '@/stores/vault.store'
import { useArchive } from '@/composables/useArchive'
import { useStorageStore } from '@/stores/storage.store'
import BackButton from '@/components/common/BackButton.vue'
import type { AttachmentInterface } from '@/types/vault.types'
import GalleryComponent from '@/components/common/GalleryComponent.vue'

const $route = useRoute()
const router = useRouter()
const vaultStore = useVaultStore()
const storageStore = useStorageStore()
const { folderMediaLoading, fetchFolderMedia } = useArchive()

const currentFlow = computed(() => $route.params.submodule)

const gallery = computed<AttachmentInterface[]>(() =>
  currentFlow.value === 'vault'
    ? (vaultStore.selectedFolder?.attachments ?? [])
    : (storageStore.folderMedia ?? []),
)

const handleGalleryBack = () => {
  router.push({ name: 'App.VaultFolderView' })
}

onMounted(async () => {
  await fetchFolderMedia()
})
</script>
