<template>
  <div class="flex flex-col bg-white overflow-y-auto h-full" :class="containerClass">
    <!-- User Profile Header -->
    <div class="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 shrink-0">
      <img :src="userAvatarUrl" :alt="userName" class="w-11 h-11 rounded-full object-cover shrink-0" />
      <div class="min-w-0">
        <p class="font-semibold text-neutral-900 text-sm truncate">{{ userName }}</p>
        <p class="text-xs text-neutral-400 truncate">Viewing: {{ viewingLabel }}</p>
      </div>
    </div>

    <!-- Scrollable sections -->
    <div class="flex-1 overflow-y-auto divide-y divide-neutral-100">
      <!-- Family Insights -->
      <SidebarSection title="Family Insights" :open="openSections.insights" @toggle="toggle('insights')">
        <div class="space-y-4 pt-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-neutral-500">Total Family Members</span>
            <span class="font-bold text-neutral-900 text-sm">{{ totalMembers }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-neutral-500">Oldest Birth Year</span>
            <span class="font-bold text-neutral-900 text-sm">{{ oldestBirthYear ?? '—' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-neutral-500">Youngest Birth Year</span>
            <span class="font-bold text-neutral-900 text-sm">{{ youngestBirthYear ?? '—' }}</span>
          </div>
        </div>
      </SidebarSection>

      <!-- Family View -->
      <SidebarSection title="Family View" :open="openSections.familyView" @toggle="toggle('familyView')">
        <div class="space-y-2 pt-2">
          <label v-for="option in familyViewOptions" :key="option.value"
            class="flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
            :class="familyView === option.value ? 'bg-primary-50' : 'hover:bg-neutral-50'"
            @click="$emit('update:familyView', option.value)">
            <span
              class="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="familyView === option.value ? 'border-primary-600' : 'border-neutral-300'">
              <span v-if="familyView === option.value" class="w-2 h-2 rounded-full bg-primary-600" />
            </span>
            <div>
              <p class="text-sm font-medium leading-tight"
                :class="familyView === option.value ? 'text-neutral-900' : 'text-neutral-700'">
                {{ option.label }}
              </p>
              <p class="text-xs text-neutral-400 mt-0.5 leading-snug">{{ option.description }}</p>
            </div>
          </label>
        </div>
      </SidebarSection>

      <!-- View Branch -->
      <SidebarSection title="View Branch" :open="openSections.branch" @toggle="toggle('branch')">
        <div class="space-y-2 pt-2">
          <label v-for="option in branchOptions" :key="option.value"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
            :class="branch === option.value ? 'bg-primary-50' : 'hover:bg-neutral-50'"
            @click="$emit('update:branch', option.value)">
            <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="branch === option.value ? 'border-primary-600' : 'border-neutral-300'">
              <span v-if="branch === option.value" class="w-2 h-2 rounded-full bg-primary-600" />
            </span>
            <p class="text-sm font-medium" :class="branch === option.value ? 'text-neutral-900' : 'text-neutral-700'">
              {{ option.label }}
            </p>
          </label>
        </div>
      </SidebarSection>

      <!-- Display -->
      <SidebarSection title="Display" :open="openSections.display" @toggle="toggle('display')">
        <div class="space-y-3 pt-2">
          <label v-for="option in displayOptions" :key="option.key"
            class="flex items-center gap-3 px-3 py-1 cursor-pointer">
            <span class="w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors"
              :class="option.value ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'"
              @click="option.onToggle()">
              <svg v-if="option.value" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white"
                class="w-3 h-3">
                <path fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clip-rule="evenodd" />
              </svg>
            </span>
            <p class="text-sm font-medium text-neutral-700">{{ option.label }}</p>
          </label>
        </div>
      </SidebarSection>

      <!-- Settings -->
      <SidebarSection title="Settings" :open="openSections.settings" @toggle="toggle('settings')">
        <div class="pt-1">
          <button v-for="item in settingsItems" :key="item.label"
            class="flex items-center justify-between w-full px-3 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
            @click="item.onClick">
            <span class="text-sm text-neutral-700">{{ item.label }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              class="w-4 h-4 text-neutral-400">
              <path fill-rule="evenodd"
                d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </SidebarSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import SidebarSection from './SidebarSection.vue'

type FamilyView = 'close' | 'extended'
type Branch = 'direct' | 'father' | 'mother'

interface Props {
  userAvatarUrl: string
  userName: string
  viewingLabel?: string
  totalMembers: number | string
  oldestBirthYear: number | string
  youngestBirthYear: number | string
  familyView: FamilyView
  branch: Branch
  showPhotos: boolean
  showNames: boolean
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  viewingLabel: 'Your Family',
  containerClass: '',
})

const emit = defineEmits<{
  (e: 'update:familyView', value: FamilyView): void
  (e: 'update:branch', value: Branch): void
  (e: 'update:showPhotos', value: boolean): void
  (e: 'update:showNames', value: boolean): void
  (e: 'open-tree-settings'): void
}>()

const openSections = reactive({
  insights: true,
  familyView: false,
  branch: false,
  display: false,
  settings: false,
})

const toggle = (section: keyof typeof openSections) => {
  openSections[section] = !openSections[section]
}

const familyViewOptions: { value: FamilyView; label: string; description: string }[] = [
  {
    value: 'close',
    label: 'Close Family',
    description: 'Parents, siblings, partner and children',
  },
  {
    value: 'extended',
    label: 'Extended Family',
    description: 'Close family, Grandparents, uncles, aunties, cousins',
  },
]

const branchOptions: { value: Branch; label: string }[] = [
  { value: 'direct', label: 'My Direct Family' },
  { value: 'father', label: "Father's Side" },
  { value: 'mother', label: "Mother's Side" },
]

const displayOptions = computed(() => [
  {
    key: 'photos',
    label: 'Show Photos',
    value: props.showPhotos,
    onToggle: () => emit('update:showPhotos', !props.showPhotos),
  },
  {
    key: 'names',
    label: 'Show Names',
    value: props.showNames,
    onToggle: () => emit('update:showNames', !props.showNames),
  },
])

const settingsItems = [
  {
    label: 'Tree Settings',
    onClick: () => emit('open-tree-settings'),
  },
  {
    label: 'Help',
    onClick: () => { },
  },
]
</script>
