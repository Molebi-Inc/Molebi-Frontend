<template>
  <div class="min-h-full bg-white">
    <div class="flex flex-col lg:flex-row h-full bg-white">
      <!-- Sidebar Navigation (Desktop) -->
      <aside class="hidden md:block w-64 border-r border-gray-200 bg-white p-6">
        <nav class="space-y-1">
          <button
            v-for="item in settingsItems.filter((item) => !item?.hide)"
            :key="item.id"
            @click="activeSection = item.id"
            :class="[
              'w-full text-left px-4 py-3 rounded-lg transition-colors',
              activeSection === item.id
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 p-5 lg:p-8 overflow-y-auto space-y-6">
        <!-- Mobile Header -->
        <section v-if="!activeSection" class="lg:hidden">
          <div class="flex items-center justify-between mb-8">
            <button
              class="h-10 w-10 flex items-center justify-center text-gray-500"
              @click="$router.push({ name: 'App.HomeView' })"
            >
              <MlbIcon name="vuesax.linear.arrow-left" />
            </button>
            <h1 class="text-lg font-semibold text-gray-800">Profile</h1>
            <span class="h-10 w-10" />
          </div>

          <div class="flex flex-col items-center gap-3 mb-6">
            <div class="flex items-center gap-9">
              <MlbButton
                text
                class="bg-gray-100! rounded-full! p-2.5!"
                @click="handleProfileAction('edit-picture')"
              >
                <template #icon>
                  <MlbIcon name="vuesax.linear.image" />
                </template>
              </MlbButton>
              <div class="w-24 h-24 rounded-full border-4 border-secondary-100 overflow-hidden">
                <img
                  :src="profileStore.userAvatarUrl"
                  :alt="displayName"
                  class="w-full h-full object-cover"
                />
              </div>
              <MlbButton
                text
                class="bg-gray-100! rounded-full! p-2.5!"
                @click="handleProfileAction('logout')"
              >
                <template #icon>
                  <MlbIcon name="vuesax.outline.logout" />
                </template>
              </MlbButton>
            </div>
            <h2 class="text-xl font-semibold text-gray-800">{{ displayName }}</h2>
          </div>

          <div>
            <button
              v-for="item in settingsItems.filter((item) => !item?.hide)"
              :key="item.id"
              class="w-full flex items-center gap-4 py-4 text-left transition-colors hover:shadow-sm"
              :class="activeSection === item.id ? 'bg-gray-50 shadow-sm' : ''"
              @click="activeSection = item.id"
            >
              <span
                class="h-10 w-10 rounded-full flex items-center justify-center text-gray-600"
                :class="
                  item.tag === 'danger'
                    ? 'bg-red-50 text-red-500'
                    : activeSection === item.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-gray-100'
                "
              >
                <MlbIcon
                  :name="item.icon ?? 'icon.moon.profile-light'"
                  :color="item.tag === 'danger' ? 'fill-red-500' : 'fill-gray-500'"
                />
              </span>
              <div class="flex-1">
                <p :class="['text-sm', item.tag === 'danger' ? 'text-red-500' : 'text-gray-700']">
                  {{ item.label }}
                </p>
                <p class="text-xs text-gray-700" v-if="item.description">
                  {{ item.description }}
                </p>
              </div>
              <span class="text-gray-400 text-xl">›</span>
            </button>
          </div>
        </section>

        <section class="bg-transparent">
          <div v-if="activeSection && !isLargeScreen" class="flex items-center gap-2">
            <button
              class="h-10 w-10 flex items-center justify-center text-gray-500"
              @click="$router.push({ name: 'App.SettingsView', params: { section: null } })"
            >
              <MlbIcon name="vuesax.linear.arrow-left" />
            </button>
            <h1 class="flex-1 text-lg font-semibold text-gray-800 text-center">
              {{ getItem(activeSection)?.label }}
            </h1>
          </div>
          <div v-if="activeSection && (isLargeScreen || !isLargeScreen)">
            <component :is="activeComponent" :key="activeSection" />
          </div>
        </section>
      </main>
    </div>
    <!-- Hidden file input for photo upload -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ProfileSettings from '@/views/settings/partials/ProfileSettings.vue'
import TreeSettings from '@/views/settings/partials/TreeSettings.vue'
import PrivacyPermissions from '@/views/settings/partials/PrivacyPermissions.vue'
import SecuritySettings from '@/views/settings/partials/SecuritySettings.vue'
import NotificationSettings from '@/views/settings/partials/NotificationSettings.vue'
import HelpView from '@/views/settings/partials/HelpView.vue'
import AboutView from '@/views/settings/partials/AboutView.vue'
import type { SettingsSection, SettingsItem } from '@/types/settings.types'
import type { Component } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { useGetSettingsMutation } from '@/services/settings.services'
import { useProfileStore } from '@/stores/profile.store'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { AlertService } from '@/services/alert.service'
import { useLogout } from '@/composables/useLogout'
import { usePhoto } from '@/composables/usePhoto'

const $route = useRoute()
const $router = useRouter()
const { logout } = useLogout()
const { handlePhotoUpload } = usePhoto()
const profileStore = useProfileStore()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const { refetch: refetchSettings } = useGetSettingsMutation()

const fileInputRef = ref<HTMLInputElement | null>(null)
const activeSection = ref<SettingsSection | null>(isLargeScreen.value ? 'profile' : null)

const settingsItems = computed<SettingsItem[]>(() => [
  {
    id: 'profile' as const,
    label: 'Profile & Account',
    component: ProfileSettings,
    description: 'View and edit your information',
    hide: false,
  },
  { id: 'tree' as const, label: 'Tree Settings', component: TreeSettings, hide: false },
  {
    id: 'privacy' as const,
    label: 'Privacy & Permissions',
    component: PrivacyPermissions,
    hide: false,
  },
  {
    id: 'security' as const,
    label: 'Security',
    component: SecuritySettings,
    hide: false,
  },
  {
    id: 'notification' as const,
    label: 'Notification',
    component: NotificationSettings,
    hide: false,
  },
  { id: 'help' as const, label: 'Help', component: HelpView, hide: false },
  { id: 'about' as const, label: 'About', component: AboutView, hide: false },
  {
    id: 'delete' as const,
    label: 'Delete Account',
    component: AboutView,
    hide: isLargeScreen.value,
    icon: 'delete',
    tag: 'danger',
  },
])

const displayName = computed(() => {
  const firstName = profileStore.user?.first_name?.trim()
  const familyName = profileStore.user?.family_name?.trim()
  const hasName = Boolean(firstName || familyName)
  return hasName ? `${firstName ?? ''} ${familyName ?? ''}`.trim() : 'Molebi User'
})

const activeComponent = computed<Component | undefined>(
  () => settingsItems.value.find((item) => item.id === activeSection.value)?.component as Component,
)

const getItem = (id: SettingsSection): SettingsItem | undefined => {
  return settingsItems.value.find((item) => item.id === id) as SettingsItem | undefined
}

const fetchSettings = async () => {
  const response = await refetchSettings()
  profileStore.setStoreProp('settings', response.data?.data ?? null)
}

const handleProfileAction = async (action: 'edit-picture' | 'logout') => {
  await AlertService.alert({
    subject: action === 'edit-picture' ? 'Change Profile Photo' : 'Logout?',
    message:
      action === 'edit-picture'
        ? 'Are you sure you want to change your profile photo?'
        : 'Are you sure you want to logout?',
    confirmButtonText: action === 'edit-picture' ? 'Upload Photo' : 'Logout',
    cancelButtonText: action === 'edit-picture' ? 'Remove Current Photo' : 'Cancel',
    customClass: {
      confirmButton: 'rounded-2xl! bg-primary-700! h-13! text-white!',
      cancelButton: 'rounded-2xl! bg-primary-50! h-13! text-primary-900!',
    },
    buttonLayout: 'vertical',
    cancelFirst: false,
    buttonConfig: {
      confirm: {
        text: action === 'edit-picture' ? 'Upload Photo' : 'Logout',
        action: async () => {
          action === 'edit-picture' ? await uploadPhoto() : await logout()
        },
        closeOnClick: true,
      },
      cancel: {
        text: action === 'edit-picture' ? 'Remove Current Photo' : 'Cancel',
        action: async () => {
          action === 'edit-picture' && (await handlePhotoUpload(null))
        },
        closeOnClick: true,
      },
    },
  })
}

const uploadPhoto = async () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null

  if (file) {
    await handlePhotoUpload(file)
  }

  // Reset the input so the same file can be selected again
  if (target) {
    target.value = ''
  }
}

onMounted(async () => {
  await fetchSettings()
})

watch(
  [() => $route.params.section, () => isLargeScreen.value],
  ([newSection, newIsLargeScreen]) => {
    activeSection.value =
      !newIsLargeScreen && !$route.params.section
        ? null
        : (newSection as SettingsSection) || 'profile'
  },
  { immediate: true, deep: true },
)

watch(activeSection, (newSection) => {
  $router.push({
    name: 'App.SettingsView',
    params: { section: newSection as SettingsSection },
  })
})
</script>
