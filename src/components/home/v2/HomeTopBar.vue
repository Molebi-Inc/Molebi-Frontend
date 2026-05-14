<script setup lang="ts">
import { h, computed, watch } from 'vue'
import { NDropdown } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import { useLogout } from '@/composables/useLogout'
import { useGetMyFamilyTreesQuery } from '@/services/family-tree.service'
import MlbIcon from '@/components/ui/MlbIcon.vue'

const $route = useRoute()
const $router = useRouter()
const profileStore = useProfileStore()
const familyTreeStore = useFamilyTreeStore()
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

// ── Family tree pill select ───────────────────────────────────────────────────
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

const handleFamilyTreeSelect = (key: string) => {
  const id = Number(key)
  if (!Number.isNaN(id)) {
    familyTreeStore.selectedFamilyTreeId = id
  }
}
</script>

<template>
  <div
    :class="['bg-[#4A4A4A] text-white h-10 flex items-center justify-between px-10 text-xs ', $route.name === 'App.FamilyTreeView' ? 'py-6' : 'py-2']">
    <div>
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
    </div>
    <div class="flex items-center justify-end gap-6">
      <!-- User dropdown -->
      <NDropdown :options="userOptions" trigger="click" placement="bottom-end" @select="handleUserSelect">
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
      <NDropdown :options="helpOptions" trigger="click" placement="bottom-end" @select="handleHelpSelect">
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
  </div>
</template>
