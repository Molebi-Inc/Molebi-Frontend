<template>
  <div class="relative w-full h-screen flex overflow-hidden tree-bg">

    <!-- Desktop: Left Sidebar -->
    <aside class="hidden md:flex flex-col w-[380px] shrink-0 p-4 z-10 overflow-y-auto">
      <div class="rounded-2xl overflow-hidden shadow-sm flex-1">
        <FamilyTreeSidebarV2 :user-avatar-url="userAvatarUrl" :user-name="userName" :viewing-label="viewingLabel"
          :total-members="familyInsights?.total_members"
          :oldest-birth-year="familyInsights?.oldest_member_birth_year ?? 'N/A'"
          :youngest-birth-year="familyInsights?.youngest_member_birth_year ?? 'N/A'" :family-view="familyView"
          :branch="branch" :show-photos="showPhotos" :show-names="showNames" @update:family-view="onFamilyViewUpdate"
          @update:branch="onBranchUpdate" @update:show-photos="onShowPhotosUpdate"
          @update:show-names="onShowNamesUpdate" @open-tree-settings="showTreeSettingsModal = true"
          @view-self-profile="openSelfProfile" />
      </div>
    </aside>
    <!-- Tree Area -->
    <div class="flex-1 relative flex flex-col min-w-0">
      <!-- Decorative background silhouettes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <!-- Top-left silhouette -->
        <div class="absolute -top-8 -left-8 w-48 h-48">
          <img src="@/assets/svg/cloud.svg" alt="cloud" class="w-full h-full" />
        </div>
        <!-- Top-right silhouette -->
        <div class="absolute -top-4 -right-4 w-56 h-56">
          <img src="@/assets/svg/cloud.svg" alt="cloud" class="w-full h-full" />
        </div>
        <!-- Bottom-left silhouette people -->
        <div class="absolute -bottom-4 left-16 w-52 h-52">
          <img src="@/assets/svg/cloud.svg" alt="cloud" class="w-full h-full" />
        </div>
        <!-- Bottom-right silhouette -->
        <div class="absolute -bottom-8 -right-4 w-44 h-44">
          <img src="@/assets/svg/cloud.svg" alt="cloud" class="w-full h-full" />
        </div>
      </div>

      <!-- Desktop Header -->
      <header class="hidden md:flex items-center justify-between px-6 py-4 relative z-10">
        <!-- Search bar -->
        <div ref="searchBarContainerRef" class="flex-1 max-w-lg relative z-20">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none">
              <path fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clip-rule="evenodd" />
            </svg>
            <input v-model="searchQuery" type="search" autocomplete="off" placeholder="Search for family member"
              class="w-full bg-white rounded-2xl py-3 pl-11 pr-12 text-sm text-neutral-700 placeholder-neutral-400 outline-none shadow-sm border border-transparent focus:border-primary-300 transition-colors"
              @focus="showSavedMembersDropdown = false" @keydown.escape="closeSearchDropdowns" />
            <button type="button" aria-label="Saved family members" :aria-expanded="showSavedMembersDropdown"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              :class="showSavedMembersDropdown ? 'text-primary-600 bg-primary-50' : ''"
              @click.stop="toggleSavedMembersDropdown">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path
                  d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM5 3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 17a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM17.25 17a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM9 10a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1 0-1.5h5.5A.75.75 0 0 1 9 10ZM17.25 10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 16.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
              </svg>
            </button>
          </div>
          <!-- Search matches -->
          <ul v-if="showSearchResultsPanel"
            class="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1 shadow-lg z-50">
            <li v-for="m in searchMemberResults" :key="m.id">
              <button type="button"
                class="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-primary-50 transition-colors"
                @click="onSelectSearchMember(m)">
                <span class="font-medium">{{ displayMemberSearchLabel(m) }}</span>
              </button>
            </li>
          </ul>
          <!-- Saved members (toggle) -->
          <ul v-else-if="showSavedMembersDropdown"
            class="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1 shadow-lg z-50">
            <li v-if="savedMembersFromStorage.length === 0" class="px-4 py-3 text-sm text-neutral-400 text-center">
              No saved members yet. Pick someone from search.
            </li>
            <li v-for="s in savedMembersFromStorage" :key="s.id">
              <button type="button"
                class="w-full px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-primary-50 transition-colors"
                @click="onSelectSavedMember(s.id)">
                <span class="font-medium">{{ savedMemberLabel(s) }}</span>
              </button>
            </li>
          </ul>
        </div>
        <!-- Add Family Member button -->
        <button
          class="ml-4 flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm px-5 py-3 rounded-2xl transition-colors shadow-sm"
          @click="handleAddMember">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path
              d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Add Family Member
        </button>
      </header>

      <!-- Mobile Header -->
      <header class="md:hidden flex items-center gap-3 px-4 py-3 relative z-10">
        <div ref="searchBarContainerRefMobile" class="flex-1 relative z-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none">
            <path fill-rule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11ZM2 9a7 7 0 1 0 12.452 4.391l3.328 3.329a.75.75 0 1 0 1.06-1.06l-3.329-3.328A7 7 0 0 0 2 9Z"
              clip-rule="evenodd" />
          </svg>
          <input v-model="searchQuery" type="search" autocomplete="off" placeholder="Search for family member"
            class="w-full bg-white rounded-2xl py-3 pl-10 pr-12 text-sm text-neutral-600 placeholder-neutral-400 outline-none shadow-sm"
            @focus="showSavedMembersDropdown = false" @keydown.escape="closeSearchDropdowns" />
          <button type="button" aria-label="Saved family members"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-primary-600"
            :class="showSavedMembersDropdown ? 'text-primary-600 bg-primary-50' : ''"
            @click.stop="toggleSavedMembersDropdown">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path
                d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM5 3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 17a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM17.25 17a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM9 10a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1 0-1.5h5.5A.75.75 0 0 1 9 10ZM17.25 10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 16.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
            </svg>
          </button>
          <ul v-if="showSearchResultsPanel"
            class="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1 shadow-lg z-50">
            <li v-for="m in searchMemberResults" :key="'m-' + m.id">
              <button type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-primary-50"
                @click="onSelectSearchMember(m)">{{ displayMemberSearchLabel(m) }}</button>
            </li>
          </ul>
          <ul v-else-if="showSavedMembersDropdown"
            class="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1 shadow-lg z-50">
            <li v-if="savedMembersFromStorage.length === 0" class="px-3 py-2 text-xs text-neutral-400 text-center">No
              saved members yet.</li>
            <li v-for="s in savedMembersFromStorage" :key="'s-' + s.id">
              <button type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-primary-50"
                @click="onSelectSavedMember(s.id)">{{ savedMemberLabel(s) }}</button>
            </li>
          </ul>
        </div>
        <!-- Settings button (opens mobile bottom sheet) -->
        <button
          class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          @click="showBottomSheet = true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <path
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </header>

      <!-- Tree Visualization -->
      <div class="flex-1 relative overflow-hidden">
        <TreeViewV2 ref="treeViewRef" :payload="treePayload" :is-loading="isLoading" :show-photos="showPhotos"
          :show-names="showNames" :show-full-name="modalShowFullName"
          :show-relationship-title="modalShowRelationshipTitle"
          :family-view="familyView === 'extended' ? 'extended' : 'close'"
          :branch="branch === 'father' ? 'father' : branch === 'mother' ? 'mother' : 'direct'"
          @node-click="openMemberProfile" @add-relative="handleAddMember" @add-first="handleAddMember" />
      </div>

      <!-- Mobile FAB: Add Family Member -->
      <button
        class="md:hidden absolute right-5 bottom-6 z-20 w-14 h-14 bg-primary-700 hover:bg-primary-800 rounded-full shadow-lg flex items-center justify-center text-white transition-colors"
        @click="handleAddMember">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
          <path fill-rule="evenodd"
            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
            clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Mobile Bottom Sheet -->
    <n-drawer v-model:show="showBottomSheet" placement="bottom" :height="'85vh'" :mask-closable="true"
      class="md:hidden">
      <n-drawer-content :body-content-style="{ padding: 0 }" :closable="false">
        <!-- Pull indicator -->
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-neutral-200" />
        </div>
        <FamilyTreeSidebarV2 :user-avatar-url="userAvatarUrl" :user-name="userName" :viewing-label="viewingLabel"
          :total-members="familyInsights?.total_members"
          :oldest-birth-year="familyInsights?.oldest_member_birth_year ?? 'N/A'"
          :youngest-birth-year="familyInsights?.youngest_member_birth_year ?? 'N/A'" :family-view="familyView"
          :branch="branch" :show-photos="showPhotos" :show-names="showNames" @update:family-view="onFamilyViewUpdate"
          @update:branch="onBranchUpdate" @update:show-photos="onShowPhotosUpdate"
          @update:show-names="onShowNamesUpdate" @open-tree-settings="showTreeSettingsModal = true"
          @view-self-profile="openSelfProfile" />
      </n-drawer-content>
    </n-drawer>

    <!-- Add Family Member Flow (modal on desktop, bottom sheet on mobile) -->
    <AddFamilyMemberFlow v-model:show="showAddMemberModal" @member-added="refreshTree"
      @view-tree="showAddMemberModal = false" @view-profile="handleViewProfile" />

    <!-- Node Action Modal (opened on node click) -->
    <NodeActionModal v-if="nodeActionMember" :show="showNodeActionModal" :member="nodeActionMember"
      :is-self="!!nodeActionMember._isSelf" @update:show="showNodeActionModal = $event"
      @view-profile="handleNodeViewProfile" @add-relative="handleAddMember" @view-branch="handleNodeViewBranch" />

    <!-- Member Profile Modal -->
    <MemberProfileModal v-if="profileModalMember" :show="showProfileModal" :member="profileModalMember"
      :is-self="!!profileModalMember._isSelf" @update:show="showProfileModal = $event" @view-in-tree="handleViewInTree"
      @edit="handleEditMember" @add-relative="handleAddMember" />

    <!-- Edit Member Modal -->
    <EditMemberModal v-if="editModalMember" :show="showEditMemberModal" :member="editModalMember"
      @update:show="showEditMemberModal = $event" @saved="handleEditSaved" />

    <TreeSettingsModal v-model:show="showTreeSettingsModal" :who-scope="whoCanEditScope"
      :show-relationship-title="modalShowRelationshipTitle" :show-full-name="modalShowFullName"
      :saving="privacySettingsSaving" @update:privacy="handleTreePrivacyUpdate" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useMessage, NDrawer, NDrawerContent } from 'naive-ui'
import type {
  FamilyTreeInterface,
  FamilyMemberInterface,
  Payload,
  FamilyInsightInterface,
  TreeSettingsFormValues,
  TreePrivacySettingsFormValues,
} from '@/types/family-tree.types'
import TreeViewV2 from '@/components/family-tree/v2/TreeViewV2.vue'
import FamilyTreeSidebarV2 from '@/components/family-tree/v2/FamilyTreeSidebarV2.vue'
import AddFamilyMemberFlow from '@/components/family-tree/v2/add-member/AddFamilyMemberFlow.vue'
import MemberProfileModal from '@/components/family-tree/v2/MemberProfileModal.vue'
import NodeActionModal from '@/components/family-tree/v2/NodeActionModal.vue'
import EditMemberModal from '@/components/family-tree/v2/EditMemberModal.vue'
import TreeSettingsModal from '@/components/family-tree/v2/TreeSettingsModal.vue'
import {
  displayFromApi,
  displayToApi,
  familyTreeSectionFromApi,
  familyTreeSectionToApi,
  viewBranchFromApi,
  viewBranchToApi,
  whoCanEditFromApi,
  treePreferenceFromApi,
  type WhoCanEditScope,
} from '@/composables/useTreeSettings'
import {
  useGetFamilyTreesQuery,
  useGetFamilyInsightsQuery,
  useGetTreeSettingsQuery,
  useGetTreePrivacySettingsQuery,
  useUpdateTreeSettingsMutation,
  useUpdateTreePrivacySettingsMutation,
} from '@/services/family-tree.service'
import { useProfileStore } from '@/stores/profile.store'
import { handleApiError } from '@/helpers/error.helpers'
import { useFamilyTreeStore } from '@/stores/family-tree.store'

const familyInsightsQuery = useGetFamilyInsightsQuery()

type FamilyView = 'close' | 'extended'
type Branch = 'direct' | 'father' | 'mother'

const $route = useRoute()
const message = useMessage()
const profileStore = useProfileStore()
const familyTreeStore = useFamilyTreeStore()

// UI state
const showBottomSheet = ref(false)
const showTreeSettingsModal = ref(false)
const showAddMemberModal = ref(false)
const showProfileModal = ref(false)
const profileModalMember = ref<(FamilyMemberInterface & { _isSelf?: boolean }) | null>(null)
const showEditMemberModal = ref(false)
const editModalMember = ref<FamilyMemberInterface | null>(null)
const showNodeActionModal = ref(false)
const nodeActionMember = ref<(FamilyMemberInterface & { _isSelf?: boolean }) | null>(null)
const treeViewRef = ref<InstanceType<typeof TreeViewV2> | null>(null)
const searchBarContainerRef = ref<HTMLElement | null>(null)
const searchBarContainerRefMobile = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const showSavedMembersDropdown = ref(false)
const isLoading = ref(false)

/** Stored in localStorage — ids + names for quick picks (see persist helper below). */
type SavedMemberSnapshot = {
  id: number
  first_name: string
  family_name: string
  full_name?: string
}

const FAMILY_TREE_SAVED_MEMBERS_KEY = 'family-tree:saved-search-members'
const savedMembersFromStorage = ref<SavedMemberSnapshot[]>([])

watch(searchQuery, () => {
  showSavedMembersDropdown.value = false
})

function loadSavedMembersFromStorage() {
  try {
    const raw = localStorage.getItem(FAMILY_TREE_SAVED_MEMBERS_KEY)
    const parsed = raw ? (JSON.parse(raw) as SavedMemberSnapshot[]) : []
    savedMembersFromStorage.value = Array.isArray(parsed) ? parsed : []
  } catch {
    savedMembersFromStorage.value = []
  }
}

function persistSavedMembers() {
  try {
    localStorage.setItem(FAMILY_TREE_SAVED_MEMBERS_KEY, JSON.stringify(savedMembersFromStorage.value))
  } catch {
    /* ignore quota */
  }
}

function saveMemberToStorage(m: Partial<FamilyMemberInterface>) {
  if (m.id == null) return
  const entry: SavedMemberSnapshot = {
    id: m.id,
    first_name: m.first_name || '',
    family_name: m.family_name || '',
    full_name: m.full_name || undefined,
  }
  const next = savedMembersFromStorage.value.filter((x) => x.id !== entry.id)
  next.unshift(entry)
  savedMembersFromStorage.value = next.slice(0, 40)
  persistSavedMembers()
}

function displayMemberSearchLabel(m: Partial<FamilyMemberInterface>) {
  return m.full_name || `${m.first_name || ''} ${m.family_name || ''}`.trim() || 'Member'
}

function savedMemberLabel(s: SavedMemberSnapshot) {
  return s.full_name || `${s.first_name} ${s.family_name}`.trim() || `Member #${s.id}`
}

function toggleSavedMembersDropdown() {
  showSavedMembersDropdown.value = !showSavedMembersDropdown.value
}

function closeSearchDropdowns() {
  showSavedMembersDropdown.value = false
}

// Sidebar options state
const familyView = ref<FamilyView>('close')
const branch = ref<Branch>('direct')
const showPhotos = ref(true)
const showNames = ref(true)

const whoCanEditScope = ref<WhoCanEditScope>('admin')
const modalShowRelationshipTitle = ref(false)
const modalShowFullName = ref(true)

const familyInsights = ref<FamilyInsightInterface>({
  oldest_member_birth_year: 'N/A',
  youngest_member_birth_year: 'N/A',
  total_members: 0,
})

// Tree data
const treePayload = ref<Payload | null>(null)
const familyTreeData = ref<FamilyTreeInterface | null>(null)

// Route
const relativeMemberId = computed(() => {
  const id = $route.query.relative_member_id
  return id ? String(id) : null
})

// Queries
const familyTreesQuery = useGetFamilyTreesQuery({
  enabled: true,
  relativeMemberId: relativeMemberId,
})

/** Tree / privacy settings routes use the signed-in user's `family_tree.id` from profile. */
const familyTreeSettingsId = computed(() => profileStore.userDetails?.family_tree?.id ?? null)

const hasFamilyTreeSettingsId = computed(() => familyTreeSettingsId.value != null)

const treeSettingsQuery = useGetTreeSettingsQuery(familyTreeSettingsId, { enabled: hasFamilyTreeSettingsId })
const treePrivacyQuery = useGetTreePrivacySettingsQuery(familyTreeSettingsId, { enabled: hasFamilyTreeSettingsId })

const updateTreeSettingsMutation = useUpdateTreeSettingsMutation(familyTreeSettingsId)
const updateTreePrivacySettingsMutation = useUpdateTreePrivacySettingsMutation(familyTreeSettingsId)

const privacySettingsSaving = computed(() => updateTreePrivacySettingsMutation.isPending.value)

const appliedInitialTreeSettings = ref(false)
const appliedInitialPrivacySettings = ref(false)

watch(familyTreeSettingsId, () => {
  appliedInitialTreeSettings.value = false
  appliedInitialPrivacySettings.value = false
})

watch(
  () => treeSettingsQuery.data.value?.data,
  (d) => {
    if (!d || appliedInitialTreeSettings.value) return
    familyView.value = familyTreeSectionFromApi(d.family_tree_section)
    branch.value = viewBranchFromApi(d.view_branch)
    const disp = displayFromApi(d.display)
    showPhotos.value = disp.showPhotos
    showNames.value = disp.showNames
    appliedInitialTreeSettings.value = true
  },
  { immediate: true },
)

watch(
  () => treePrivacyQuery.data.value?.data,
  (d) => {
    if (!d || appliedInitialPrivacySettings.value) return
    whoCanEditScope.value = whoCanEditFromApi(d.who_can_edit_profile)
    const p = treePreferenceFromApi(d.tree_preference)
    modalShowRelationshipTitle.value = p.showRelationshipTitle
    modalShowFullName.value = p.showFullName
    appliedInitialPrivacySettings.value = true
  },
  { immediate: true },
)

function buildTreeSettingsPayload(): TreeSettingsFormValues {
  return {
    family_tree_section: familyTreeSectionToApi(familyView.value),
    view_branch: viewBranchToApi(branch.value),
    display: displayToApi(showPhotos.value, showNames.value),
  }
}

async function persistTreeSettings() {
  if (!familyTreeSettingsId.value) return
  try {
    const res = await updateTreeSettingsMutation.mutateAsync(buildTreeSettingsPayload())
    if (res.data) {
      familyView.value = familyTreeSectionFromApi(res.data.family_tree_section)
      branch.value = viewBranchFromApi(res.data.view_branch)
      const disp = displayFromApi(res.data.display)
      showPhotos.value = disp.showPhotos
      showNames.value = disp.showNames
    }
  } catch (error) {
    handleApiError(error, message)
  }
}

async function onFamilyViewUpdate(v: FamilyView) {
  familyView.value = v
  await persistTreeSettings()
}

async function onBranchUpdate(v: Branch) {
  branch.value = v
  await persistTreeSettings()
}

async function onShowPhotosUpdate(v: boolean) {
  showPhotos.value = v
  await persistTreeSettings()
}

async function onShowNamesUpdate(v: boolean) {
  showNames.value = v
  await persistTreeSettings()
}

async function handleTreePrivacyUpdate(payload: TreePrivacySettingsFormValues) {
  if (!familyTreeSettingsId.value) return
  try {
    const res = await updateTreePrivacySettingsMutation.mutateAsync(payload)
    if (res.data) {
      whoCanEditScope.value = whoCanEditFromApi(res.data.who_can_edit_profile)
      const p = treePreferenceFromApi(res.data.tree_preference)
      modalShowRelationshipTitle.value = p.showRelationshipTitle
      modalShowFullName.value = p.showFullName
    }
  } catch (error) {
    handleApiError(error, message)
  }
}

// Profile
const userAvatarUrl = computed(() => profileStore.userAvatarUrl)
const userName = computed(() => {
  const u = profileStore.userDetails?.first_name + ' ' + profileStore.userDetails?.family_name
  return u || 'You'
})

const viewingLabel = computed(() => {
  const u = profileStore.userDetails
  return u?.family_name ? `${u.family_name} Family` : 'Your Family'
})

// Family insights computed from tree data
const allFlatMembers = computed<Partial<FamilyMemberInterface>[]>(() => {
  if (!familyTreeData.value) return []
  const { familyTree } = familyTreeData.value
  const members: Partial<FamilyMemberInterface>[] = []
  Object.values(familyTree).forEach((group) => {
    if (Array.isArray(group)) members.push(...group)
    else if (group) members.push(group as Partial<FamilyMemberInterface>)
  })
  // Deduplicate by id
  const seen = new Set<number>()
  return members.filter((m) => {
    if (!m.id || seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })
})

const searchMemberResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allFlatMembers.value
    .filter((m) => {
      const parts = [m.first_name, m.family_name, m.middle_name, m.full_name].map((s) =>
        (s || '').toLowerCase(),
      )
      return parts.some((p) => p.includes(q))
    })
    .slice(0, 20)
})

const showSearchResultsPanel = computed(
  () =>
    searchQuery.value.trim().length > 0 &&
    searchMemberResults.value.length > 0 &&
    !showSavedMembersDropdown.value,
)

function onSelectSearchMember(m: Partial<FamilyMemberInterface>) {
  saveMemberToStorage(m)
  searchQuery.value = ''
  showSavedMembersDropdown.value = false
  const full = allFlatMembers.value.find((x) => x.id === m.id)
  if (full) {
    treeViewRef.value?.highlightMember(full as FamilyMemberInterface)
  } else {
    message.warning('Member not found on the current tree.')
  }
}

function onSelectSavedMember(id: number) {
  showSavedMembersDropdown.value = false
  const full = allFlatMembers.value.find((x) => x.id === id)
  if (full) {
    treeViewRef.value?.highlightMember(full as FamilyMemberInterface)
  } else {
    message.warning('Member not found on the current tree.')
  }
}

onClickOutside(searchBarContainerRef, () => {
  showSavedMembersDropdown.value = false
})
onClickOutside(searchBarContainerRefMobile, () => {
  showSavedMembersDropdown.value = false
})

// Transform FamilyTreeInterface to Payload
const transformPerson = (member: Partial<FamilyMemberInterface>): FamilyMemberInterface | null => {
  if (!member.id) return null
  return {
    id: member.id,
    first_name: member.first_name || '',
    family_name: member.family_name || '',
    full_name: member.full_name || `${member.first_name || ''} ${member.family_name || ''}`.trim(),
    profile_picture_url: member.profile_picture_url || null,
    gender: member.gender || 'prefer_not_to_say',
    is_registered: member.is_registered || false,
    middle_name: member.middle_name || null,
    nickname: member.nickname || null,
    tagged_media: member.tagged_media || [],
    relationship_metadata: {
      relation_type: member.relationship_metadata?.relation_type || '',
      related_through: member.relationship_metadata?.related_through || null,
      parent_id: member.relationship_metadata?.parent_id || null,
      is_adoptive: member.relationship_metadata?.is_adoptive || false,
      is_former: member.relationship_metadata?.is_former || false,
    },
  }
}

const buildPayload = (data: FamilyTreeInterface): Payload | null => {
  const { familyTree } = data

  let selfMember: Partial<FamilyMemberInterface> | undefined
  if (Array.isArray(familyTree.self)) {
    selfMember = familyTree.self[0]
  } else {
    selfMember = familyTree.self as Partial<FamilyMemberInterface>
  }
  if (!selfMember?.id) return null

  const spouseArray = familyTree.spouse || []
  const primarySpouse =
    spouseArray.find((s: Partial<FamilyMemberInterface>) => !s.relationship_metadata?.is_former) ||
    spouseArray[0] ||
    null

  const selfTransformed = transformPerson(selfMember)
  if (!selfTransformed) return null

  const self: FamilyMemberInterface & { spouse?: FamilyMemberInterface | null } = {
    ...selfTransformed,
    spouse: primarySpouse ? transformPerson(primarySpouse) : null,
  }

  const filterValid = (arr: Partial<FamilyMemberInterface>[] | undefined) =>
    arr?.map(transformPerson).filter((p: FamilyMemberInterface | null): p is FamilyMemberInterface => p !== null)

  return {
    self,
    parents: filterValid(familyTree.parents),
    spouse: filterValid(familyTree.spouse),
    siblings: filterValid(familyTree.siblings),
    children: filterValid(familyTree.children),
    grandparents: filterValid(familyTree.grandparents),
    grandchildren: filterValid(familyTree.grandchildren),
    aunts_uncles: filterValid(familyTree.aunts_uncles),
    nieces_nephews: filterValid(familyTree.nieces_nephews),
    cousins: filterValid(familyTree.cousins),
    in_laws: filterValid(familyTree.in_laws),
  } as unknown as Payload
}

// Watchers
watch(
  () => familyTreesQuery.data.value,
  (data) => {
    if (data?.data) {
      familyTreeData.value = data.data
      familyTreeStore.setStoreProp('familyTreeData', data.data)
      treePayload.value = buildPayload(data.data)
    }
  },
  { immediate: true },
)

watch(
  () => familyTreesQuery.isFetching.value,
  (loading) => {
    isLoading.value = loading
  },
)

watch(
  () => $route.query.relative_member_id,
  () => {
    familyTreesQuery.refetch()
  },
)

// Handlers
const handleAddMember = () => {
  showAddMemberModal.value = true
}

const refreshTree = async () => {
  try {
    const [treeRes, insightsRes] = await Promise.all([
      familyTreesQuery.refetch(),
      familyInsightsQuery.refetch(),
    ])
    if (treeRes.data?.data) {
      familyTreeData.value = treeRes.data.data
      treePayload.value = buildPayload(treeRes.data.data)
    }
    if (insightsRes.data?.data) {
      familyInsights.value = insightsRes.data.data
    }
  } catch (error) {
    handleApiError(error, message)
  }
}

const openMemberProfile = (member: FamilyMemberInterface & { _isSelf?: boolean }) => {
  nodeActionMember.value = member
  showNodeActionModal.value = true
}

const handleNodeViewProfile = (member: FamilyMemberInterface & { _isSelf?: boolean }) => {
  profileModalMember.value = member
  showProfileModal.value = true
}

const handleNodeViewBranch = (member: FamilyMemberInterface) => {
  treeViewRef.value?.highlightMember(member)
}

const handleViewProfile = (memberId: number) => {
  // Find the member in the flat list and open their profile
  const found = allFlatMembers.value.find((m) => m.id === memberId)
  if (found) openMemberProfile(found as FamilyMemberInterface)
}

const openSelfProfile = () => {
  const selfMember = treePayload.value?.self
  if (!selfMember) return
  showBottomSheet.value = false
  profileModalMember.value = { ...selfMember, _isSelf: true }
  showProfileModal.value = true
}

const handleViewInTree = (member: FamilyMemberInterface) => {
  treeViewRef.value?.highlightMember(member)
}

const handleEditMember = (member: FamilyMemberInterface) => {
  editModalMember.value = member
  showEditMemberModal.value = true
}

const handleEditSaved = (updated: FamilyMemberInterface) => {
  // Update the profileModalMember if it matches so the profile modal reflects changes
  if (profileModalMember.value && profileModalMember.value.id === updated.id) {
    profileModalMember.value = { ...profileModalMember.value, ...updated }
  }
  refreshTree()
}

const fetchFamilyInsights = async () => {
  try {
    const res = await familyInsightsQuery.refetch()
    familyInsights.value = res.data?.data as FamilyInsightInterface
  } catch (error) {
    handleApiError(error, message)
  }
}

onMounted(async () => {
  loadSavedMembersFromStorage()
  await fetchFamilyInsights()
})
</script>

<style scoped>
.tree-bg {
  background-color: #C9E1E9;
}
</style>
