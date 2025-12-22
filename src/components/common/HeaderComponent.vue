<template>
  <div class="grid grid-cols-4 md:grid-cols-10 bg-white py-5 md:px-8 rounded-2xl mb-8">
    <div class="text-neutral-900 text-h2 font-bold col-span-3">
      <span v-if="isLargeScreen">
        {{ pageTitle }}
      </span>
      <span v-else class="flex items-center gap-2">
        <img
          :src="profileStore.userAvatarUrl"
          :alt="
            profileStore.userDetails?.first_name + ' ' + profileStore.userDetails?.family_name ||
            'Profile Image'
          "
          class="w-10 h-10 rounded-full"
          @click="$router.push({ name: 'App.SettingsView', params: { section: null } })"
        />
        <span>
          <p class="text-sm text-gray-800">Welcome, {{ profileStore.userDetails?.first_name }}</p>
          <p class="text-sm text-primary-300">seed phase</p>
        </span>
      </span>
    </div>
    <div v-if="isLargeScreen" class="col-span-3"></div>
    <div class="flex items-center gap-4 col-span-1 md:col-span-4 justify-end">
      <n-popover
        trigger="click"
        :show-arrow="false"
        placement="bottom-end"
        to="body"
        :z-index="4000"
        style="padding: 0; border-radius: 16px; border: 1px solid #f2f2f2"
      >
        <template #trigger>
          <div
            class="cursor-pointer h-12 w-12 bg-gray-50 flex justify-center items-center rounded-full relative"
          >
            <MlbIcon name="vuesax.linear.notification" />
            <span
              v-if="mockNotifications.length"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-3 rounded-full px-1.5 py-0.5"
            >
              {{ mockNotifications.length }}
            </span>
          </div>
        </template>
        <NotificationComponent :notifications="mockNotifications" :is-mobile="!isLargeScreen" />
      </n-popover>
      <div
        v-if="isLargeScreen"
        class="cursor-pointer h-12 w-12 bg-gray-50 flex justify-center items-center rounded-full"
        @click="$router.push({ name: 'App.SettingsView', params: { section: 'help' } })"
      >
        <MlbIcon name="question" />
      </div>
      <div v-if="isLargeScreen">
        <n-dropdown :options="options" @select="handleSelect" class="z-10! profile-dropdown">
          <n-button text type="tertiary" @click.stop.prevent="(e) => e?.stopPropagation()">
            <img
              :src="profileStore.userAvatarUrl"
              :alt="
                profileStore.userDetails?.first_name +
                  ' ' +
                  profileStore.userDetails?.family_name || 'Profile Image'
              "
              class="w-12 h-12 rounded-full border border-secondary-100 object-cover"
            />
          </n-button>
        </n-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { NDropdown, NButton, NPopover } from 'naive-ui'
import NotificationComponent from '@/components/common/NotificationComponent.vue'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useProfileStore } from '@/stores/profile.store'
import { useLogout } from '@/composables/useLogout'

const $route = useRoute()
const $router = useRouter()
const { logout } = useLogout()
const profileStore = useProfileStore()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const mockNotifications = [
  // {
  //   id: '1',
  //   title: 'A new branch has grown!',
  //   message: 'Sarah Johnson has been added to your family tree.',
  //   timeAgo: '2hr ago',
  //   type: 'branch',
  // },
  // {
  //   id: '2',
  //   title: 'Connection Request',
  //   message: 'John Doe wants to join your family tree.',
  //   timeAgo: '2 days ago',
  //   type: 'connection',
  //   actions: [
  //     { label: 'Approve', approve: true },
  //     { label: 'Decline', approve: false },
  //   ],
  // },
  // {
  //   id: '3',
  //   title: 'Memory Shared',
  //   message: 'Grandma Ada just shared a photo from 1975',
  //   timeAgo: '2 weeks ago',
  //   type: 'memory',
  // },
  // {
  //   id: '4',
  //   title: 'Birthday Reminder',
  //   message: 'It’s Uncle Tunde’s birthday today! Send him wishes.',
  //   timeAgo: '2 weeks ago',
  //   type: 'birthday',
  // },
  // {
  //   id: '5',
  //   title: 'Family Tree Update',
  //   message: 'Your family tree has new updates—explore recent additions.',
  //   timeAgo: '2hr ago',
  //   type: 'update',
  // },
]

const pageTitle = computed(() => {
  const baseTitle = $route.meta.pageTitle as string
  if ($route.name === 'App.HomeView' && profileStore.userDetails?.first_name) {
    return `${baseTitle} ${profileStore.userDetails.first_name}`
  }
  return baseTitle
})

const options = ref([
  {
    label: 'Logout',
    key: 'logout',
    icon: () => h(MlbIcon, { name: 'vuesax.outline.logout', size: 18, color: '#5C5C5C' }),
  },
])

const handleSelect = async (key: string) => {
  if (key === 'logout') {
    await logout()
  }
}
</script>

<style scoped>
:deep(.profile-dropdown .n-dropdown-menu) {
  min-width: 180px !important;
  padding: 8px 4px !important;
}

:deep(.profile-dropdown .n-dropdown-option) {
  padding: 12px 16px !important;
  font-size: 15px !important;
  min-height: 44px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

:deep(.profile-dropdown .n-dropdown-option:hover) {
  background-color: #f5f5f5 !important;
}
</style>
