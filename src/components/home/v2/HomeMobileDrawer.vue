<script setup lang="ts">
import { h, computed, watch } from 'vue'
import { NDrawer, NDropdown } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useProfileStore } from '@/stores/profile.store'
import { useLogout } from '@/composables/useLogout'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import { useGetMyFamilyTreesQuery } from '@/services/family-tree.service'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'update:show', value: boolean): void }>()

const $route = useRoute()
const $router = useRouter()
const profileStore = useProfileStore()
const { logout } = useLogout()
const familyTreeStore = useFamilyTreeStore()

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
  { label: 'Memories', icon: 'vuesax.outline.folder-open', routeName: 'App.StorageFolderView' },
  // { label: 'Time capsules', icon: 'time-capsule', routeName: 'App.TimeCapsules.View', disabled: true },
  // { label: 'Vault', icon: 'vault', routeName: 'App.VaultView', disabled: true },
  { label: 'Time capsules', icon: 'time-capsule', routeName: '', disabled: true },
  { label: 'Vault', icon: 'vault', routeName: '', disabled: true },
]

const close = () => emit('update:show', false)

const handleFamilyTreeSelect = (key: string) => {
  const id = Number(key)
  if (!Number.isNaN(id)) {
    familyTreeStore.selectedFamilyTreeId = id
  }
}
const { data: myTreesData } = useGetMyFamilyTreesQuery()

const myTrees = computed(() => myTreesData.value?.data ?? [])

watch(myTrees, (trees) => {
  if (!trees.length) return
  familyTreeStore.myFamilyTrees = trees
  if (familyTreeStore.selectedFamilyTreeId != null) return
  const ownerTree = trees.find((t) => t.is_owner) ?? trees[0]
  familyTreeStore.selectedFamilyTreeId = ownerTree?.id ?? null
}, { immediate: true })

const selectedTree = computed(() =>
  myTrees.value.find((t) => t.id === familyTreeStore.selectedFamilyTreeId) ?? myTrees.value[0],
)

const familyTreeLabel = computed(() => {
  if (selectedTree.value) return selectedTree.value.name
  const ft = profileStore.userDetails?.family_tree
  return ft?.name || `${profileStore.userDetails?.family_name ?? ''} Family Tree`.trim()
})

const familyTreeOptions = computed(() =>
  myTrees.value.map((t) => ({
    label: t.name,
    key: String(t.id),
    icon: () => h(MlbIcon, { name: 'vuesax.outline.hierarchy', size: 14, color: '#737373' }),
  })),
)
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
            $route.name === link.routeName && !link.disabled
              ? 'bg-primary-50 text-primary-700'
              : 'text-neutral-700 hover:bg-neutral-50',
            link.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ]" @click="close">
          <MlbIcon :name="link.icon" :size="22" />
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Footer: user, help, language -->
      <div class="border-t border-neutral-100 px-3 py-4 space-y-1">
        <NDropdown v-if="$route.name === 'App.FamilyTreeView'" :options="familyTreeOptions" trigger="click"
          placement="bottom-start" @select="handleFamilyTreeSelect">
          <button
            class="flex items-center gap-2 bg-[#3EB369] hover:bg-primary-500 transition-colors text-white text-sm font-medium px-4 py-1.5 rounded-full">
            <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MlbIcon name="user" :size="13" color="#ffffff" />
            </span>
            <span class="max-w-[180px] truncate">{{ familyTreeLabel }}</span>
            <MlbIcon name="vuesax.linear.arrow-right" :size="11" class="rotate-90 opacity-80" />
          </button>
        </NDropdown>

        <!-- User dropdown -->
        <NDropdown :options="userOptions" trigger="click" placement="bottom-end" @select="handleUserSelect">
          <button
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <MlbIcon name="user" :size="22" />
            <span class="flex-1 text-left">
              {{ profileStore.userDetails?.first_name }} {{ profileStore.userDetails?.family_name }}
            </span>
            <MlbIcon name="vuesax.linear.arrow-right" :size="16" class="rotate-90 text-neutral-400" />
          </button>
        </NDropdown>

        <!-- Help dropdown -->
        <NDropdown :options="helpOptions" trigger="click" placement="bottom-end" @select="handleHelpSelect">
          <button
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
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
