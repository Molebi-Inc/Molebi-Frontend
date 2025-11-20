<template>
  <div class="grid grid-cols-2 md:grid-cols-10 bg-white py-5 px-6 md:px-8 rounded-2xl mb-8">
    <div class="text-neutral-900 text-h2 font-bold md:col-span-3">
      <span v-if="isLargeScreen">
        {{ $route.meta.pageTitle }}
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
    <div v-if="isLargeScreen" class="col-span-3">
      <MlbInput
        v-model="search"
        placeholder="Search for something"
        customClass="rounded-full! bg-gray-100!"
      >
        <template #prefix>
          <MlbIcon name="vuesax.linear.search-normal.svg" :size="18" class="bg-[#807F94]! mr-1" />
        </template>
      </MlbInput>
    </div>
    <div class="flex items-center gap-4 md:col-span-4 justify-end">
      <div
        class="cursor-pointer h-12 w-12 bg-gray-50 flex justify-center items-center rounded-full"
      >
        <MlbIcon name="vuesax.linear.notification" />
      </div>
      <div
        v-if="isLargeScreen"
        class="cursor-pointer h-12 w-12 bg-gray-50 flex justify-center items-center rounded-full"
      >
        <MlbIcon name="question" />
      </div>
      <div v-if="isLargeScreen">
        <n-dropdown
          :show="showDropdown"
          :options="options"
          @select="handleSelect"
          class="z-10! profile-dropdown"
        >
          <n-button text type="tertiary" @click.stop.prevent="handleShowDropdown">
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
import { ref, h } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { NDropdown, NButton } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import { useProfileStore } from '@/stores/profile.store'
import { useLogout } from '@/composables/useLogout'

const $route = useRoute()
const $router = useRouter()
const { logout } = useLogout()
const profileStore = useProfileStore()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const search = ref<string | null>(null)
const showDropdown = ref<boolean>(false)
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

const handleShowDropdown = () => {
  showDropdown.value = !showDropdown.value
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
