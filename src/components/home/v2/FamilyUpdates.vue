<script setup lang="ts">
import { computed } from 'vue'
import { NSpin } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import FamilyUpdateItem from './FamilyUpdateItem.vue'
import type { Announcement } from '@/types/announcement.types'

const PREVIEW_COUNT = 2

const props = defineProps<{
  items: Announcement[]
  loading: boolean
}>()

defineEmits<{
  (e: 'create'): void
  (e: 'view-all'): void
  (e: 'edit-item', item: Announcement): void
  (e: 'delete-item', id: number): void
}>()

const visibleItems = computed(() => props.items.slice(0, PREVIEW_COUNT))
const hasMore = computed(() => props.items.length > PREVIEW_COUNT)
</script>

<template>
  <div class="bg-white rounded-2xl p-5 shadow-sm">
    <!-- Section header -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <h2 class="text-xl font-bold text-neutral-900">
        <span class="hidden md:inline">Family Updates</span>
        <span class="md:hidden">Family Update</span>
      </h2>

      <!-- Desktop: view-all link (always visible) -->
      <button
        class="hidden md:flex items-center gap-1 text-sm bg-primary-50 px-3 py-2 rounded-3xl text-primary-700 hover:text-primary-800 shrink-0 mt-0.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @click="$emit('view-all')">
        View all family updates
        <MlbIcon name="vuesax.linear.arrow-right" :size="16" />
      </button>

      <!-- Mobile: + create button -->
      <button
        class="md:hidden w-7 h-7 border-primary-700 flex items-center justify-center shrink-0 text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @click="$emit('create')">
        <span class="text-lg leading-none">+</span>
      </button>
    </div>

    <p class="text-xs text-gray-600 font-medium mb-5 leading-relaxed">
      Share an update with your family, upcoming events or activities, everyone can engage,
      comment, like and share
    </p>
    <hr class="border-neutral-100 mb-4">

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-10">
      <NSpin :show="true">
        <template #description>
          <span class="text-sm text-neutral-400">Loading updates...</span>
        </template>
      </NSpin>
    </div>

    <!-- Empty state -->
    <div v-else-if="!items.length" class="text-center py-8">
      <p class="text-sm text-neutral-400 mb-5 leading-relaxed">
        Oops, looks like there are no updates yet! Add an update
      </p>
      <button
        class="bg-primary hover:bg-primary-900 text-white text-sm font-semibold px-6 py-3 rounded-3xl transition-colors w-[80%] md:w-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @click="$emit('create')">
        <span class="hidden md:inline">Add your first update</span>
        <span class="md:hidden">Create your first announcement</span>
      </button>
    </div>

    <!-- First 2 items -->
    <div v-else class="space-y-3">
      <FamilyUpdateItem v-for="item in visibleItems" :key="item.id" :item="item" @edit="$emit('edit-item', $event)"
        @delete="$emit('delete-item', $event)" />

      <!-- View all — shown when list is truncated (desktop already has it in header) -->
      <button v-if="hasMore"
        class="w-full mt-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @click="$emit('view-all')">
        View all family updates
        <MlbIcon name="vuesax.linear.arrow-right" :size="16" />
      </button>
    </div>
  </div>
</template>
