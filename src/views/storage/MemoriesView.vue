<template>
  <div class="min-h-screen flex flex-col">
    <!-- ── Mobile tabs ─────────────────────────────────────────────────────── -->
    <div class="md:hidden flex border-b border-neutral-200 bg-white px-4">
      <button v-for="tab in ['All Memories', 'Album'] as const" :key="tab"
        class="flex-1 py-3 text-sm font-medium transition-colors relative" :class="mobileTab === tab
          ? 'text-primary-700'
          : 'text-neutral-500 hover:text-neutral-700'
          " @click="onMobileTabChange(tab)">
        {{ tab }}
        <div v-if="mobileTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700 rounded-full" />
      </button>
    </div>

    <!-- ── Body ───────────────────────────────────────────────────────────── -->
    <div class="flex-1 flex">

      <!-- Desktop two-column layout -->
      <div class="hidden md:flex gap-4 px-8 py-5 w-full items-stretch">
        <!-- Sidebar -->
        <MemoriesSidebar :folders="folders" :active-album-id="selectedAlbumId" @select-all="selectedAlbumId = null"
          @select-all-albums="selectedAlbumId = null" @select-album="selectAlbum"
          @create-album="showCreateAlbum = true" />

        <!-- Main content column: top bar + content panel -->
        <div class="flex-1 min-w-0 flex flex-col gap-3">

          <!-- ── Top bar: search + action ── -->
          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="flex-1 relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
                  <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
              <input v-model="searchQuery" type="text" placeholder="Search for a document, folder, file..."
                class="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400" />
              <!-- Filter button -->
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4H16M5 9H13M8 14H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <!-- Add memories button -->
            <button
              class="flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white rounded-full text-sm font-semibold hover:bg-primary-800 transition-colors whitespace-nowrap"
              @click="handleAddMemories">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V14M2 8H14" stroke="white" stroke-width="2" stroke-linecap="round" />
              </svg>
              Add memories
            </button>
          </div>

          <!-- Content panel -->
          <div class="flex-1 min-w-0 bg-white rounded-2xl overflow-hidden flex flex-col">
            <!-- Album header (when album selected) -->
            <div v-if="selectedAlbumId !== null" class="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
              <button class="text-neutral-500 hover:text-neutral-800 transition-colors" @click="selectedAlbumId = null">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
              <h2 class="flex-1 text-base font-semibold text-neutral-900">{{ selectedAlbum?.name }}</h2>
              <AlbumActionsMenu @edit="activeModal = 'edit'" @share="activeModal = 'share'" @tag="activeModal = 'tag'"
                @delete="activeModal = 'delete'" />
            </div>

            <!-- Loading -->
            <div v-if="mediaLoading" class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
            </div>

            <!-- Empty state -->
            <MemoriesEmptyState v-else-if="displayedMedia.length === 0" :album-name="selectedAlbum?.name"
              @add="handleAddMemories" />

            <!-- Media grid -->
            <div v-else class="p-5">
              <MemoriesMediaGrid :items="displayedMedia" @item-click="openViewer(displayedMedia, $event)" />
            </div>
          </div>

        </div><!-- end main content column -->

      </div>

      <!-- Mobile: All Memories tab -->
      <div v-if="mobileTab === 'All Memories'" class="md:hidden flex-1 flex flex-col relative">
        <!-- Album detail header on mobile -->
        <div v-if="mobileAlbumId !== null"
          class="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
          <button class="text-neutral-600 p-1" @click="mobileAlbumId = null">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <h2 class="text-sm font-semibold text-neutral-900">{{ mobileSelectedAlbum?.name }}</h2>
          <AlbumActionsMenu @edit="activeModal = 'edit'" @share="activeModal = 'share'" @tag="activeModal = 'tag'"
            @delete="activeModal = 'delete'" />
        </div>

        <!-- File count (album detail) -->
        <div v-if="mobileAlbumId !== null" class="flex items-center justify-between px-4 py-2 bg-white">
          <div class="flex -space-x-1.5">
            <div v-for="(item, i) in mobileAlbumMedia.slice(0, 4)" :key="i"
              class="w-6 h-6 rounded-full border-2 border-white bg-neutral-200 overflow-hidden">
              <img v-if="item.thumbnail" :src="item.thumbnail" class="w-full h-full object-cover" />
            </div>
          </div>
          <span class="text-xs text-neutral-500">{{ mobileAlbumMedia.length.toLocaleString() }} Files</span>
        </div>

        <!-- Loading -->
        <div v-if="mobileMediaLoading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Empty state -->
        <MemoriesEmptyState v-else-if="mobileDisplayedMedia.length === 0" :album-name="mobileSelectedAlbum?.name"
          class="flex-1" @add="handleAddMemories" />

        <!-- Grid -->
        <div v-else class="px-3 py-3 pb-24">
          <MemoriesMediaGrid :items="mobileDisplayedMedia" @item-click="openViewer(mobileDisplayedMedia, $event)">
            <template #fab>
              <MemoriesAddFab @add-media="handleAddMemories" @add-audio="handleAddMemories" />
            </template>
          </MemoriesMediaGrid>
        </div>

        <MemoriesAddFab v-if="mobileDisplayedMedia.length === 0" @add-media="handleAddMemories"
          @add-audio="handleAddMemories" />
      </div>

      <!-- Mobile: Album tab -->
      <div v-else class="md:hidden flex-1 flex flex-col pb-24">
        <!-- Empty albums -->
        <MemoriesEmptyState v-if="folders.length === 0" class="flex-1" @add="showCreateAlbum = true" />

        <!-- Album list -->
        <div v-else class="flex-1">
          <MemoriesAlbumRow v-for="album in folders" :key="album.id" :album="album" variant="list"
            @select="onMobileAlbumSelect(album.id)" />
        </div>

        <!-- FAB -->
        <MemoriesAddFab @add-media="showCreateAlbum = true" @add-audio="showCreateAlbum = true" />
      </div>
    </div>

    <!-- ── Album action modals ───────────────────────────────────────────── -->
    <EditAlbumModal :show="activeModal === 'edit'" :initial-name="activeAlbum?.name"
      :initial-description="activeAlbum?.description" :loading="albumCreating as boolean"
      @update:show="activeModal = null" @save="handleEditAlbum" />
    <DeleteAlbumModal :show="activeModal === 'delete'" :album-name="activeAlbum?.name ?? ''" :loading="deleteLoading"
      @update:show="activeModal = null" @confirm="handleDeleteAlbum" />
    <ShareAlbumModal :show="activeModal === 'share'" :album-name="activeAlbum?.name ?? ''"
      :album-id="activeAlbum?.id ?? null" @update:show="activeModal = null" @shared="fetchStorageFolders" />
    <TagFamilyModal :show="activeModal === 'tag'" :album-name="activeAlbum?.name ?? ''"
      :album-id="activeAlbum?.id ?? null" @update:show="activeModal = null" @tagged="fetchStorageFolders" />

    <!-- ── Create album modal ─────────────────────────────────────────────── -->
    <CreateAlbumModal ref="createAlbumModalRef" :show="showCreateAlbum" :loading="albumCreating as boolean"
      @update:show="showCreateAlbum = $event" @create="submitCreateAlbum" @add-media="onAlbumCreatedAddMedia" />

    <!-- ── Media viewer ──────────────────────────────────────────────────── -->
    <MediaViewerModal :show="showViewer" :items="viewerItems" :initial-index="viewerIndex"
      :album-name="selectedAlbum?.name || mobileSelectedAlbum?.name"
      :description="selectedAlbum?.description || mobileSelectedAlbum?.description"
      @update:show="showViewer = $event" />

    <!-- ── Add memory modal ───────────────────────────────────────────────── -->
    <AddMemoryModal :show="showAddMemory" @update:show="showAddMemory = $event" @submit="handleMemorySubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useStorage } from '@/composables/useStorage'
import { useStorageStore } from '@/stores/storage.store'
import type { StorageFolderInterface } from '@/types/storage.types'
import type { FamilyMediaFormValues } from '@/types/family-tradition.types'
import { useUpdateFolderMutation, useDeleteFolderMutation } from '@/services/storage.services'
import MemoriesSidebar from '@/components/storage/v2/MemoriesSidebar.vue'
import MemoriesEmptyState from '@/components/storage/v2/MemoriesEmptyState.vue'
import MemoriesMediaGrid from '@/components/storage/v2/MemoriesMediaGrid.vue'
import MemoriesAlbumRow from '@/components/storage/v2/MemoriesAlbumRow.vue'
import MemoriesAddFab from '@/components/storage/v2/MemoriesAddFab.vue'
import CreateAlbumModal from '@/components/storage/v2/CreateAlbumModal.vue'
import AddMemoryModal from '@/components/storage/v2/AddMemoryModal.vue'
import MediaViewerModal from '@/components/shared/media/MediaViewerModal.vue'
import AlbumActionsMenu from '@/components/storage/v2/AlbumActionsMenu.vue'
import EditAlbumModal from '@/components/storage/v2/EditAlbumModal.vue'
import DeleteAlbumModal from '@/components/storage/v2/DeleteAlbumModal.vue'
import ShareAlbumModal from '@/components/storage/v2/ShareAlbumModal.vue'
import TagFamilyModal from '@/components/storage/v2/TagFamilyModal.vue'
import type { AttachmentInterface } from '@/types/vault.types'

const message = useMessage()
const storageStore = useStorageStore()
const {
  fetchStorageFolders,
  handleCreateFolder,
  fetchFolderMedia,
  handleCreateFile,
  loading: albumCreating,
} = useStorage()
const updateFolderMutation = useUpdateFolderMutation()
const deleteFolderMutation = useDeleteFolderMutation()

const createAlbumModalRef = ref<InstanceType<typeof CreateAlbumModal> | null>(null)

// ── State ────────────────────────────────────────────────────────────────────

const searchQuery = ref('')
const mobileTab = ref<'All Memories' | 'Album'>('All Memories')
const showCreateAlbum = ref(false)
const showAddMemory = ref(false)
const showViewer = ref(false)
const viewerItems = ref<AttachmentInterface[]>([])
const viewerIndex = ref(0)

// Desktop: selected album id (null = all media)
const selectedAlbumId = ref<number | null>(null)

// Mobile: selected album (within "All Memories" tab after clicking from Albums tab)
const mobileAlbumId = ref<number | null>(null)

// Album action modals
const activeModal = ref<'edit' | 'share' | 'tag' | 'delete' | null>(null)
const deleteLoading = ref(false)

// ── Computed ─────────────────────────────────────────────────────────────────

const folders = computed(() => storageStore.folders)

const selectedAlbum = computed<StorageFolderInterface | null>(
  () => folders.value.find((f) => f.id === selectedAlbumId.value) ?? null,
)

const mobileSelectedAlbum = computed<StorageFolderInterface | null>(
  () => folders.value.find((f) => f.id === mobileAlbumId.value) ?? null,
)

// The album currently in context for actions (desktop or mobile)
const activeAlbum = computed(() => selectedAlbum.value ?? mobileSelectedAlbum.value)

// Desktop: all media (flattened from all folders) or album media
const allMedia = computed(() => folders.value.flatMap((f) => f.media ?? []))

const albumMedia = computed(() => storageStore.folderMedia)

const mediaLoading = computed(
  () => storageStore.foldersLoading || storageStore.folderMediaLoading,
)

const displayedMedia = computed(() => {
  const items =
    selectedAlbumId.value !== null
      ? albumMedia.value
      : allMedia.value

  if (!searchQuery.value.trim()) return items
  const q = searchQuery.value.toLowerCase()
  return items.filter((m) => m.file_name?.toLowerCase().includes(q))
})

// Mobile all-memories tab
const mobileAlbumMedia = computed(() => storageStore.folderMedia)
const mobileMediaLoading = computed(() => storageStore.folderMediaLoading)

const mobileDisplayedMedia = computed(() => {
  if (mobileAlbumId.value !== null) return mobileAlbumMedia.value
  return allMedia.value
})

// ── Methods ──────────────────────────────────────────────────────────────────

const selectAlbum = async (id: number) => {
  selectedAlbumId.value = id
  storageStore.setStoreProp('selectedFolder', folders.value.find((f) => f.id === id) ?? null)
  await fetchFolderMedia()
}

const onMobileAlbumSelect = async (id: number) => {
  mobileAlbumId.value = id
  mobileTab.value = 'All Memories'
  storageStore.setStoreProp('selectedFolder', folders.value.find((f) => f.id === id) ?? null)
  await fetchFolderMedia()
}

const onMobileTabChange = (tab: 'All Memories' | 'Album') => {
  mobileTab.value = tab
  if (tab === 'All Memories') mobileAlbumId.value = null
}

const openViewer = (items: AttachmentInterface[], item: AttachmentInterface) => {
  viewerItems.value = items
  viewerIndex.value = items.findIndex((i) => i.id === item.id)
  showViewer.value = true
}

const handleAddMemories = () => {
  showAddMemory.value = true
}

const submitCreateAlbum = async (name: string) => {
  try {
    await handleCreateFolder({ name, title: name })
    createAlbumModalRef.value?.showSuccess()
    await fetchStorageFolders()
  } catch {
    // error handled in composable
  }
}

const onAlbumCreatedAddMedia = () => {
  showCreateAlbum.value = false
  showAddMemory.value = true
}

const handleMemorySubmit = async (data: FamilyMediaFormValues) => {
  if (!storageStore.selectedFolder) {
    message.warning('Please select an album first')
    return
  }
  await handleCreateFile(data)
  await fetchFolderMedia()
  if (selectedAlbumId.value !== null) await fetchFolderMedia()
}

const handleEditAlbum = async (data: { name: string; description: string }) => {
  if (!activeAlbum.value) return
  try {
    await updateFolderMutation.mutateAsync({
      id: activeAlbum.value.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      folder: { name: data.name, title: data.name, description: data.description } as any,
    })
    message.success('Album updated successfully')
    activeModal.value = null
    await fetchStorageFolders()
  } catch {
    message.error('Failed to update album')
  }
}

const handleDeleteAlbum = async () => {
  if (!activeAlbum.value) return
  deleteLoading.value = true
  try {
    await deleteFolderMutation.mutateAsync({ id: activeAlbum.value.id })
    message.success('Album deleted')
    activeModal.value = null
    selectedAlbumId.value = null
    mobileAlbumId.value = null
    await fetchStorageFolders()
  } catch {
    message.error('Failed to delete album')
  } finally {
    deleteLoading.value = false
  }
}

// Re-fetch album media when desktop album changes
watch(selectedAlbumId, async (id) => {
  if (id !== null) {
    storageStore.setStoreProp('selectedFolder', folders.value.find((f) => f.id === id) ?? null)
    await fetchFolderMedia()
  }
})

onMounted(async () => {
  await fetchStorageFolders()
})
</script>
