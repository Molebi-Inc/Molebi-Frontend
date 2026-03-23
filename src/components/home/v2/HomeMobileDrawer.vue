<script setup lang="ts">
import { h } from 'vue'
import { NDrawer, NDropdown } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useProfileStore } from '@/stores/profile.store'
import { useLogout } from '@/composables/useLogout'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'update:show', value: boolean): void }>()

const $route = useRoute()
const $router = useRouter()
const profileStore = useProfileStore()
const { logout } = useLogout()

// ── User dropdown (profile/account/logout) ─────────────────────────────────────
const userOptions = [
  {
    label: 'My Profile',
    key: 'profile',
    icon: () => h(MlbIcon, { name: 'user', size: 14, color: '#737373' }),
  },
  {
    label: 'Account Settings',
    key: 'settings',
    icon: () => h(MlbIcon, { name: 'gear', size: 14, color: '#737373' }),
  },
  { type: 'divider', key: 'divider-1' },
  {
    label: 'Logout',
    key: 'logout',
    icon: () => h(MlbIcon, { name: 'vuesax.outline.logout', size: 14, color: '#C20000' }),
  },
]

const handleUserSelect = (key: string) => {
  if (key === 'profile') {
    $router.push({ name: 'App.SettingsView' })
    close()
  }
  if (key === 'settings') {
    $router.push({ name: 'App.SettingsView' })
    close()
  }
  if (key === 'logout') {
    logout()
    close()
  }
}

// ── Help dropdown (support/resources/contact us) ───────────────────────────────
const helpOptions = [
  {
    label: 'Support',
    key: 'support',
    icon: () => h(MlbIcon, { name: 'circular-question', size: 14, color: '#737373' }),
  },
  {
    label: 'Resources',
    key: 'resources',
    icon: () => h(MlbIcon, { name: 'lightbulb', size: 14, color: '#737373' }),
  },
  {
    label: 'Contact Us',
    key: 'contact',
    icon: () => h(MlbIcon, { name: 'vuesax.linear.people', size: 14, color: '#737373' }),
  },
]

const handleHelpSelect = () => {
  // TODO: wire up support/resources/contact routes when available
  close()
}

const navLinks = [
  { label: 'Home', icon: 'vuesax.broken.home-2', routeName: 'App.HomeView' },
  { label: 'Family Tree', icon: 'family-tree', routeName: 'App.FamilyTreeView' },
  { label: 'Memories', icon: 'vuesax.outline.folder-open', routeName: 'App.StorageLayout' },
  { label: 'Time capsules', icon: 'time-capsule', routeName: 'App.TimeCapsules.View' },
  { label: 'Vault', icon: 'vault', routeName: 'App.VaultView' },
]

const close = () => emit('update:show', false)
</script>

<template>
  <NDrawer :show="show" :width="280" placement="left" @update:show="emit('update:show', $event)">
    <div class="flex flex-col h-full bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <img src="@/assets/svg/logo.svg" alt="Mòlèbì" class="h-8 w-auto" />
        <button class="text-neutral-500 hover:text-neutral-800 transition-colors" @click="close">
          <MlbIcon name="vuesax.linear.close-circle" :size="24" />
        </button>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink v-for="link in navLinks" :key="link.label" :to="{ name: link.routeName }"
          class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors" :class="[
            $route.name === link.routeName
              ? 'bg-primary-50 text-primary-700'
              : 'text-neutral-700 hover:bg-neutral-50',
          ]" @click="close">
          <MlbIcon :name="link.icon" :size="22" />
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Footer: user, help, language -->
      <div class="border-t border-neutral-100 px-3 py-4 space-y-1">
        <!-- User dropdown -->
        <NDropdown
          :options="userOptions"
          trigger="click"
          placement="bottom-end"
          @select="handleUserSelect"
        >
          <button
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <MlbIcon name="user" :size="22" />
            <span class="flex-1 text-left">
              {{ profileStore.userDetails?.first_name }} {{ profileStore.userDetails?.family_name }}
            </span>
            <MlbIcon name="vuesax.linear.arrow-right" :size="16" class="rotate-90 text-neutral-400" />
          </button>
        </NDropdown>

        <!-- Help dropdown -->
        <NDropdown
          :options="helpOptions"
          trigger="click"
          placement="bottom-end"
          @select="handleHelpSelect"
        >
          <button
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <MlbIcon name="circular-question" :size="22" />
            <span class="flex-1 text-left">Help</span>
            <MlbIcon name="vuesax.linear.arrow-right" :size="16" class="rotate-90 text-neutral-400" />
          </button>
        </NDropdown>

        <button
          class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
          <MlbIcon name="language" :size="22" />
          <span>English</span>
        </button>
      </div>
    </div>
  </NDrawer>
</template>
