<script setup lang="ts">
import { h } from 'vue'
import { NDropdown } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import { useLogout } from '@/composables/useLogout'
import MlbIcon from '@/components/ui/MlbIcon.vue'

const $router = useRouter()
const profileStore = useProfileStore()
const { logout } = useLogout()

// ── User dropdown ─────────────────────────────────────────────────────────────
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
  if (key === 'profile') $router.push({ name: 'App.SettingsView' })
  if (key === 'settings') $router.push({ name: 'App.SettingsView' })
  if (key === 'logout') logout()
}

// ── Help dropdown ─────────────────────────────────────────────────────────────
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

const handleHelpSelect = (_key: string) => {
  // TODO: wire up support/resources/contact routes when available
}
</script>

<template>
  <div class="bg-[#4A4A4A] text-white h-10 flex items-center justify-end px-10 gap-6 text-xs">
    <!-- User dropdown -->
    <NDropdown
      :options="userOptions"
      trigger="click"
      placement="bottom-end"
      @select="handleUserSelect"
    >
      <button class="flex items-center gap-1.5 hover:text-white/80 transition-colors">
        <MlbIcon name="user" :size="15" />
        <span>
          {{ profileStore.userDetails?.first_name }} {{ profileStore.userDetails?.family_name }}
        </span>
        <MlbIcon name="vuesax.linear.arrow-right" :size="12" class="rotate-90" />
      </button>
    </NDropdown>

    <!-- Notifications (no dropdown) -->
    <button class="hover:text-white/80 transition-colors">
      <MlbIcon name="notification" :size="17" />
    </button>

    <!-- Help dropdown -->
    <NDropdown
      :options="helpOptions"
      trigger="click"
      placement="bottom-end"
      @select="handleHelpSelect"
    >
      <button class="flex items-center gap-1.5 hover:text-white/80 transition-colors">
        <MlbIcon name="circular-question" :size="15" />
        <span>Help</span>
        <MlbIcon name="vuesax.linear.arrow-right" :size="12" class="rotate-90" />
      </button>
    </NDropdown>

    <!-- Language (no dropdown yet) -->
    <button class="flex items-center gap-1.5 hover:text-white/80 transition-colors">
      <MlbIcon name="language" :size="15" />
      <span>English</span>
    </button>
  </div>
</template>
