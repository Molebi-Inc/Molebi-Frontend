<template>
  <div class="min-h-screen flex flex-col bg-[#F5FCF8]">
    <div class="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-8 py-4 md:py-6 w-full">
      <!-- Desktop sidebar -->
      <div class="hidden md:block pt-2 shrink-0">
        <VaultSidebar :active="activeNav" @select="onNavSelect" />
      </div>

      <div class="flex-1 min-w-0 flex flex-col gap-3 md:gap-4">
        <!-- Search + CTA -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:mt-12">
          <div class="flex-1 relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search for a document, folder, file..."
              class="w-full pl-9 pr-11 py-2.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Filter"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4H16M5 9H13M8 14H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            class="hidden sm:flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B5E20] text-white rounded-full text-sm font-semibold hover:bg-[#145214] transition-colors whitespace-nowrap shrink-0"
            @click="$emit('add-to-vault')"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V14M2 8H14" stroke="white" stroke-width="2" stroke-linecap="round" />
            </svg>
            + Add to vault
          </button>
        </div>

        <!-- Mobile: vault scope -->
        <div class="md:hidden">
          <n-dropdown :options="mobileNavOptions" @select="onMobileNavSelect">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-neutral-200 text-sm font-semibold text-[#1B5E20] shadow-sm"
            >
              {{ mobileNavLabel }}
              <MlbIcon name="vuesax.linear.arrow-down" :size="16" />
            </button>
          </n-dropdown>
        </div>

        <!-- Main panel -->
        <div class="flex-1 min-h-0 bg-white rounded-3xl border border-neutral-100 shadow-sm p-4 md:p-6 space-y-8">
          <!-- Folders -->
          <section
            v-if="activeNav === 'all' || activeNav === 'folders' || activeNav === 'shared'"
            id="vault-folders"
          >
            <div class="flex items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-neutral-900">Folders</h2>
              <button
                type="button"
                class="text-sm font-medium text-[#1B5E20] hover:underline"
                @click="scrollToFolders"
              >
                View all folders &gt;
              </button>
            </div>
            <div
              class="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4 overflow-x-auto"
            >
              <div v-if="foldersLoading" class="flex gap-3 py-6">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="h-36 w-48 shrink-0 rounded-2xl bg-neutral-200/60 animate-pulse"
                />
              </div>
              <div v-else-if="visibleFolders.length === 0" class="py-10 text-center text-sm text-neutral-500">
                No folders yet. Use &ldquo;Add to vault&rdquo; to create one.
              </div>
              <div v-else class="flex gap-4 pb-1">
                <VaultFolderStripCard
                  v-for="folder in visibleFolders"
                  :key="folder.id"
                  :folder="folder"
                  @folder-menu="$emit('folder-menu', $event)"
                />
              </div>
            </div>
          </section>

          <!-- Files -->
          <section
            v-if="activeNav === 'all' || activeNav === 'files' || activeNav === 'shared' || activeNav === 'recent'"
            id="vault-files"
          >
            <div class="flex items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-neutral-900">Files</h2>
              <button
                type="button"
                class="text-sm font-medium text-[#1B5E20] hover:underline"
                @click="scrollToFiles"
              >
                View all files &gt;
              </button>
            </div>
            <div v-if="foldersLoading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              <div
                v-for="n in 8"
                :key="n"
                class="h-44 rounded-2xl bg-neutral-200/60 animate-pulse"
              />
            </div>
            <div
              v-else-if="visibleFileRows.length === 0"
              class="py-12 text-center text-sm text-neutral-500"
            >
              No files match this view or search.
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              <VaultFileGridItem
                v-for="row in visibleFileRows"
                :key="`${row.folderId}-${row.attachment.id}`"
                :item="row"
                @open="openFile"
              />
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Mobile FAB -->
    <button
      type="button"
      class="md:hidden fixed bottom-6 right-4 z-30 w-14 h-14 rounded-full bg-[#1B5E20] text-white shadow-lg flex items-center justify-center hover:bg-[#145214] transition-colors"
      aria-label="Add to vault"
      @click="$emit('add-to-vault')"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4V20M4 12H20" stroke="white" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    </button>

    <MediaViewerModal2 v-model:show="showViewer" :media="viewerMedia" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NDropdown } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useVaultStore } from '@/stores/vault.store'
import { useArchive } from '@/composables/useArchive'
import VaultSidebar, { type VaultNavId } from '@/components/vault/v2/VaultSidebar.vue'
import VaultFolderStripCard from '@/components/vault/v2/VaultFolderStripCard.vue'
import VaultFileGridItem, { type VaultFileRow } from '@/components/vault/v2/VaultFileGridItem.vue'
import MediaViewerModal2 from '@/components/shared/media/MediaViewerModal2.vue'
import type { FolderInterface } from '@/types/vault.types'

defineEmits<{
  (e: 'add-to-vault'): void
  (e: 'folder-menu', value: { key: string; folder: FolderInterface }): void
}>()

const router = useRouter()
const vaultStore = useVaultStore()
const { fetchArchiveFolders } = useArchive()

const searchQuery = ref('')
const activeNav = ref<VaultNavId>('all')
const showViewer = ref(false)
const viewerMedia = ref<VaultFileRow['attachment'] | null>(null)

const folders = computed(() => vaultStore.folders as FolderInterface[])
const foldersLoading = computed(() => vaultStore.foldersLoading)

const navLabels: Record<VaultNavId, string> = {
  all: 'All vault item',
  folders: 'Folders',
  files: 'Files',
  shared: 'Shared with me',
  recent: 'Recent',
  settings: 'Vault Settings',
}

const mobileNavLabel = computed(() => navLabels[activeNav.value])

const mobileNavOptions = computed(() =>
  (['all', 'folders', 'files', 'shared', 'recent'] as VaultNavId[]).map((id) => ({
    label: navLabels[id],
    key: id,
  })),
)

const onMobileNavSelect = (key: string) => {
  onNavSelect(key as VaultNavId)
}

const allFileRows = computed<VaultFileRow[]>(() => {
  const rows: VaultFileRow[] = []
  for (const folder of folders.value) {
    for (const a of folder.attachments ?? []) {
      rows.push({
        attachment: a,
        folderTitle: folder.title,
        folderId: folder.id,
      })
    }
  }
  return rows
})

const searchLower = computed(() => searchQuery.value.trim().toLowerCase())

const matchesSearchFolder = (folder: FolderInterface) => {
  if (!searchLower.value) return true
  return folder.title.toLowerCase().includes(searchLower.value)
}

const matchesSearchRow = (row: VaultFileRow) => {
  if (!searchLower.value) return true
  const name = (row.attachment.file_name || row.attachment.title || '').toLowerCase()
  return name.includes(searchLower.value) || row.folderTitle.toLowerCase().includes(searchLower.value)
}

const visibleFolders = computed(() => {
  let list = folders.value.filter(matchesSearchFolder)
  if (activeNav.value === 'shared') {
    list = list.filter((f) => f.is_public)
  }
  return list
})

const baseFileRows = computed(() => {
  let rows = allFileRows.value.filter(matchesSearchRow)
  if (activeNav.value === 'shared') {
    const sharedIds = new Set(folders.value.filter((f) => f.is_public).map((f) => f.id))
    rows = rows.filter((r) => sharedIds.has(r.folderId))
  }
  if (activeNav.value === 'recent') {
    rows = [...rows].sort((a, b) => {
      const da = a.attachment.date ? new Date(a.attachment.date).getTime() : 0
      const db = b.attachment.date ? new Date(b.attachment.date).getTime() : 0
      return db - da
    })
  }
  return rows
})

const visibleFileRows = computed(() => {
  if (activeNav.value === 'recent') {
    return baseFileRows.value.slice(0, 24)
  }
  return baseFileRows.value
})

const onNavSelect = (id: VaultNavId) => {
  if (id === 'settings') {
    router.push({ name: 'App.SettingsView' })
    return
  }
  activeNav.value = id
}

const scrollToFiles = () => {
  document.getElementById('vault-files')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const scrollToFolders = () => {
  document.getElementById('vault-folders')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const openFile = (row: VaultFileRow) => {
  viewerMedia.value = row.attachment
  showViewer.value = true
}

onMounted(() => {
  void fetchArchiveFolders()
})
</script>
