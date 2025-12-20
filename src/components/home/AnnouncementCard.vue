<template>
  <div
    :class="{
      'flex justify-center items-center h-full': loading,
    }"
  >
    <div v-if="!items.length && !loading">
      <div
        class="py-9 px-4 bg-white rounded-2xl border border-gray-200 md:border-none shadow-[0px_4px_50px_0px_#a8a8a81a]"
      >
        <p class="text-gray-400 text-sm font-medium text-center">
          You don't have any announcements yet? <br />Let's start one!<br /><br />
          Click the announcement button <br />
          to start
        </p>
      </div>
    </div>
    <div v-else-if="loading" class="flex justify-center items-center">
      <n-spin :show="!!loading" class="mb-8">
        <template #description>
          <span class="text-sm text-gray-500"> Getting announcements... </span>
        </template>
      </n-spin>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="announcement in items"
        :key="announcement.id"
        class="p-4 bg-white rounded-2xl cursor-pointer"
        style="box-shadow: 0px 4px 30px 0px #0000001a"
        @click="handleClick(announcement)"
      >
        <div class="flex items-center justify-between gap-1 mb-3">
          <span
            :class="[
              'text-[10px] px-2 font-medium py-0.5 rounded-[20px]',
              {
                'text-red-500 bg-red-100': announcement.priority.toLowerCase() === 'high',
                'text-yellow-500 bg-yellow-100': announcement.priority.toLowerCase() === 'medium',
                'text-blue-500 bg-blue-100': announcement.priority.toLowerCase() === 'low',
              },
            ]"
            >⚉ {{ announcement.priority.toLowerCase() }}
          </span>
          <div>
            <n-dropdown
              :show="showDropdown(announcement.id)"
              :options="options"
              @select="(key) => handleSelect(key, announcement)"
              class="z-10!"
            >
              <n-button
                text
                type="tertiary"
                @click.stop.prevent="(e: MouseEvent) => handleShowDropdown(announcement.id, e)"
              >
                <MlbIcon
                  name="vuesax.linear.more"
                  :size="20"
                  color="#737373"
                  style="transform: rotate(90deg)"
                />
              </n-button>
            </n-dropdown>
          </div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-0.5">{{ announcement.title }}</h3>
        <p class="text-xs text-gray-700 mb-3 line-clamp-2" :title="announcement.content">
          {{ announcement.content }}
        </p>
        <hr class="mt-4 mb-3 border-gray-300" />
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-700 mt-4 flex items-center gap-0.5">
            <MlbIcon name="vuesax.linear.eye" color="#A1A1A1" size="16" />
            {{ announcement.view_count }}
            <span class="text-gray-300 mr-0.5">/ {{ announcement.members.length }} </span> Views
          </div>
          <MlbAvatar
            :options="{ firstname_field: 'name', src_field: 'avatar', users: announcement.members }"
            :max="5"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { NSpin, NDropdown, NButton } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
import type { Announcement } from '@/types/announcement.types'
import { useRouter, useRoute } from 'vue-router'
import { useAnnouncementStore } from '@/stores/announcement.store'
import { useHome } from '@/composables/useHome'
import { AlertService } from '@/services/alert.service'

withDefaults(
  defineProps<{
    items: Announcement[]
    loading: boolean
  }>(),
  {
    items: () => [],
    loading: false,
  },
)
const $route = useRoute()
const $router = useRouter()
const announcementStore = useAnnouncementStore()
const { deleteAnnouncement } = useHome()

const selectedId = ref<string | number>(0)

const showDropdown = (id: string | number) => {
  return selectedId.value === id
}

const options = [
  // {
  //   label: 'Resend',
  //   key: 'resend',
  //   icon: () => h(MlbIcon, { name: 'vuesax.broke.add-square', size: 12, color: '#737373' }),
  // },
  {
    label: 'Edit & Resend',
    key: 'edit',
    icon: () => h(MlbIcon, { name: 'vuesax.broke.add-square', size: 12, color: '#C20000' }),
  },
  // {
  //   label: 'Withdraw',
  //   key: 'withdraw',
  //   icon: () => h(MlbIcon, { name: 'placeholder', size: 12, color: '#AB5314' }),
  // },
  {
    label: 'Delete',
    key: 'delete',
    icon: () => h(MlbIcon, { name: 'delete', size: 12, color: '#C20000' }),
  },
]

const handleSelect = (key: string, announcement: Announcement) => {
  const action = {
    edit: () => {
      announcementStore.setStoreProp('selectedAnnouncement', announcement)
      $router.push({ name: $route.name, query: { ftype: 'announcement', fid: announcement.id } })
    },
    delete: () => deleteAnnouncement(announcement.id),
  }
  action[key as keyof typeof action]()
}

const handleShowDropdown = (id: string | number, e?: MouseEvent) => {
  e?.stopPropagation()

  selectedId.value === id ? (selectedId.value = 0) : (selectedId.value = id)
}

const handleClick = (announcement: Announcement) => {
  AlertService.info({
    subject: announcement.title,
    message: announcement.content,
    closable: true,
    showIcon: false,
    closablePosition: 'left',
    html: `<div class="max-w-3xl mx-auto py-3 border-y border-gray-300">
  <div class="flex items-start justify-between gap-6">
    <div class="flex-1 min-w-0">
      <div class="text-[10px] font-semibold text-gray-600">Created by:</div>
      <div class="mt-1 text-xs font-medium text-gray-700 truncate">
  ${announcement.creator?.name || 'Molebi User'}
      </div>
    </div>

    <div class="flex-1 min-w-0 text-right">
      <div class="text-[10px] font-semibold text-gray-600">Happening:</div>
      <div class="mt-1 text-xs font-medium text-gray-700">
        ${announcement.created_at}
      </div>
    </div>
  </div>`,
    showCancelButton: false,
  })
}
</script>
