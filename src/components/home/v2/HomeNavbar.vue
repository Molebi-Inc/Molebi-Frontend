<script setup lang="ts">
import { h } from 'vue'
import { NDropdown } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'

const $route = useRoute()
const $router = useRouter()

// ── Top nav links (shown in the navbar row) ───────────────────────────────────
const navLinks = [
  { label: 'Home', icon: 'vuesax.broken.home-2', routeName: 'App.HomeView' },
  { label: 'Family Tree', icon: 'family-tree', routeName: 'App.FamilyTreeView' },
  { label: 'Memories', icon: 'vuesax.outline.folder-open', routeName: 'App.StorageFolderView' },
  {
    label: 'Time capsules', icon: 'time-capsule',
    // routeName: 'App.TimeCapsules.View', disabled: true 
    routeName: '', disabled: true
  },
  {
    label: 'Vault', icon: 'vault',
    // routeName: 'App.VaultView', disabled: true 
    routeName: '', disabled: true
  },
]

// ── Hamburger dropdown options ────────────────────────────────────────────────
const menuOptions = [
  {
    label: 'Home',
    key: 'App.HomeView',
    icon: () => h(MlbIcon, { name: 'vuesax.broken.home-2', size: 16, color: '#737373' }),
  },
  {
    label: 'Family Tree',
    key: 'App.FamilyTreeView',
    icon: () => h(MlbIcon, { name: 'family-tree', size: 16, color: '#737373' }),
  },
  {
    label: 'Memories',
    key: 'App.StorageFolderView',
    icon: () => h(MlbIcon, { name: 'vuesax.outline.folder-open', size: 16, color: '#737373' }),
  },
  {
    label: 'Time Capsules',
    key: 'App.TimeCapsules.View',
    icon: () => h(MlbIcon, { name: 'time-capsule', size: 16, color: '#737373' }),
    disabled: true,
  },
  {
    label: 'Vault',
    key: 'App.VaultView',
    icon: () => h(MlbIcon, { name: 'vault', size: 16, color: '#737373' }),
    disabled: true,
  },
  { type: 'divider', key: 'divider-1' },
  {
    label: 'Cultural Heritage',
    key: 'App.Heritage',
    icon: () => h(MlbIcon, { name: 'vuesax.outline.bank', size: 16, color: '#737373' }),
    disabled: true,
  },
  {
    label: 'Family Updates',
    key: 'App.HomeView.Updates',
    icon: () => h(MlbIcon, { name: 'vuesax.linear.people', size: 16, color: '#737373' }),
  },
]

const handleMenuSelect = (key: string) => {
  if (key === 'App.HomeView.Updates') {
    $router.push({ name: 'App.HomeView', query: { ftype: 'announcement' } })
  } else {
    $router.push({ name: key })
  }
}
</script>

<template>
  <nav class="bg-white border-b border-neutral-100 flex items-center px-30 py-3">
    <div class="flex items-center gap-3 shrink-0">
      <img src="@/assets/svg/logo.svg" alt="Mòlèbì" class="h-9 w-auto" />

    </div>

    <div class="flex items-center gap-3 justify-evenly w-full">
      <!-- Hamburger → dropdown -->
      <NDropdown :options="menuOptions" trigger="click" placement="bottom-start" @select="handleMenuSelect">
        <button class="text-neutral-500 hover:text-neutral-800 transition-colors">
          <MlbIcon name="vuesax.linear.menu" :size="22" />
        </button>
      </NDropdown>
      <RouterLink v-for="link in navLinks" :key="link.label" :to="{ name: link.routeName }"
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors" :class="[
          $route.name === link.routeName && !link.disabled
            ? 'bg-primary-50 text-primary-700'
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
          link.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]">
        <MlbIcon :name="link.icon" :size="18" />
        {{ link.label }}
      </RouterLink>
    </div>
  </nav>
</template>
