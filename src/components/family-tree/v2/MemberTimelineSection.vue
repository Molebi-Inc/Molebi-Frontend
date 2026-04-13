<template>
  <div>
    <!-- Section header -->
    <div class="flex items-center justify-between px-5 py-4 cursor-pointer select-none" @click="open = !open">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Timeline</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          class="w-4 h-4 text-neutral-400 transition-transform duration-200" :class="open ? 'rotate-180' : ''">
          <path fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd" />
        </svg>
      </div>
      <button
        class="flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
        @click.stop="openAddModal">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path
            d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        Add
      </button>
    </div>

    <!-- Expanded content -->
    <div v-if="open" class="pb-5">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-6">
        <div class="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Empty -->
      <div v-else-if="allEntries.length === 0" class="px-5 py-4 text-sm text-neutral-400 text-center">
        No timeline entries yet.
      </div>

      <!-- Entries grouped by year -->
      <div v-else class="px-5 flex flex-col gap-6">
        <div v-for="group in groupedEntries" :key="group.year">
          <div v-for="(entry, idx) in group.entries" :key="entry.id" class="flex gap-4 items-start">
            <!-- Year label (only on first entry of each year group) -->
            <div class="w-12 shrink-0 pt-0.5">
              <span v-if="idx === 0" class="text-sm font-bold text-neutral-900">{{ group.year }}</span>
            </div>

            <!-- Entry content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-neutral-900 leading-snug">{{ entry.title }}</p>
              <p v-if="entry.event_date" class="text-sm text-neutral-400 mt-0.5">
                {{ formatDate(entry.event_date) }}
              </p>
              <p v-if="entry.place" class="text-sm text-neutral-400">{{ entry.place }}</p>
              <p v-if="entry.description" class="text-sm text-neutral-500 mt-1 leading-relaxed">
                {{ entry.description }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 shrink-0 pt-0.5">
              <button
                class="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Edit" @click="editEntry(entry)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
                  <path
                    d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474ZM4.75 13.5c-.69 0-1.25-.56-1.25-1.25V5.5A1.25 1.25 0 0 1 4.75 4.25h3a.75.75 0 0 0 0-1.5h-3A2.75 2.75 0 0 0 2 5.5v6.75A2.75 2.75 0 0 0 4.75 15h6.75A2.75 2.75 0 0 0 14.25 12.25v-3a.75.75 0 0 0-1.5 0v3A1.25 1.25 0 0 1 11.5 13.5h-6.75Z" />
                </svg>
              </button>
              <button class="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete" @click="confirmDelete(entry)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
                  <path fill-rule="evenodd"
                    d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add / Edit timeline modal -->
  <AddTimelineModal :show="showModal" :member-id="Number(memberId)" :member-first-name="memberFirstName"
    :edit-entry="entryToEdit" @update:show="showModal = $event" @saved="onSaved" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import type { TimelineEntryInterface } from '@/types/family-tree.types'
import { useGetTimelinesQuery, useDeleteTimelineMutation } from '@/services/family-tree.service'
import AddTimelineModal from './AddTimelineModal.vue'

const props = defineProps<{
  memberId: number
  memberFirstName: string
}>()

const message = useMessage()
const open = ref(false)
const showModal = ref(false)
const entryToEdit = ref<TimelineEntryInterface | null>(null)

const timelinesQuery = useGetTimelinesQuery(computed(() => props.memberId))
const deleteMutation = useDeleteTimelineMutation(computed(() => props.memberId))

const loading = computed(() => timelinesQuery.isFetching.value)

// Flatten all entries from all year groups into a single list
const allEntries = computed<TimelineEntryInterface[]>(() => {
  const groups = timelinesQuery.data.value?.data ?? []
  return groups.flatMap((g) => g.entries)
})

const groupedEntries = computed(() => {
  const groups = timelinesQuery.data.value?.data ?? []
  return groups.map((g) => ({ year: g.year, entries: g.entries }))
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const openAddModal = () => {
  entryToEdit.value = null
  showModal.value = true
  open.value = true
}

const editEntry = (entry: TimelineEntryInterface) => {
  entryToEdit.value = entry
  showModal.value = true
}

const confirmDelete = async (entry: TimelineEntryInterface) => {
  if (!confirm(`Delete "${entry.title}"?`)) return
  try {
    await deleteMutation.mutateAsync(entry.id)
    message.success('Deleted')
    timelinesQuery.refetch()
  } catch {
    message.error('Failed to delete')
  }
}

const onSaved = () => {
  timelinesQuery.refetch()
}
</script>
