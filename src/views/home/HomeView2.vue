<template>
    <main class="flex-1 bg-transparent">
        <!-- Desktop: two-column layout -->
        <div class="hidden md:flex gap-6 max-w-[1200px] mx-auto px-10 py-8">
            <!-- Left sidebar: user card + tree illustration -->
            <aside class="w-[300px] flex-shrink-0 space-y-6">
                <UserStatsCard :user="user" :family-members-count="familyMembersCount" :memories-count="memoriesCount"
                    @add-members="goToFamilyTree" @add-memories="goToStorage" />
                <div class="flex justify-center">
                    <!-- <img src="@/assets/svg/tree-3.svg" alt="Family tree illustration"
                            class="w-full max-w-[260px]" /> -->
                    <HomeBottomLeftTree />
                </div>
            </aside>

            <!-- Right: main content stack -->
            <div class="flex-1 min-w-0 space-y-5">
                <HeroBanner @try-now="$router.push({ name: 'App.StorageFolderView' })"
                    @time-capsule="$router.push({ name: 'App.TimeCapsules.View' })"
                    @explore-culture="$router.push({ name: 'App.HeritageView' })" />
                <FamilyTreeChecklist :user-name="userName" @add-relative="goToFamilyTree" />
                <FamilyUpdates :items="announcements" :loading="loadingAnnouncements" @create="handleCreateAnnouncement"
                    @view-all="showAllUpdatesModal = true" @edit-item="handleEditAnnouncement"
                    @delete-item="handleDeleteAnnouncement" />
            </div>
        </div>

        <!-- Mobile: single-column layout -->
        <div class="md:hidden px-4 pt-5 pb-2 space-y-4">
            <p class="text-sm text-gray-800 px-4">
                Welcome back 👋 <strong class="text-gray-800 text-base ms-1">{{ userName }}</strong>
            </p>
            <HeroBanner @try-now="$router.push({ name: 'App.StorageFolderView' })"
                @time-capsule="$router.push({ name: 'App.TimeCapsules.View' })"
                @explore-culture="$router.push({ name: 'App.HeritageView' })" />
            <FamilyTreeChecklist :user-name="userName" @add-relative="goToFamilyTree" />
            <FamilyTreeActions @add-relative="goToFamilyTree" @add-memory="goToStorage"
                @explore-culture="$router.push({ name: 'App.HeritageView' })" />
            <FamilyUpdates :items="announcements" :loading="loadingAnnouncements" @create="handleCreateAnnouncement"
                @view-all="showAllUpdatesModal = true" @edit-item="handleEditAnnouncement"
                @delete-item="handleDeleteAnnouncement" />
        </div>
    </main>

    <MlbModal v-model:show="showHomeFormModal" class="rounded-3xl!" :bottom-sheet="!isLargeScreen"
        :bottom-sheet-height="462" @update:show="onHomeFormModalShowUpdate" @close="handleCloseForm">
        <template #header>
            <div class="flex items-center justify-between">
                <div></div>
                <div class="text-center flex-1">
                    <h1 class="text-xl font-bold text-gray-900 hidden md:block">
                        {{ homeFormTitle }}
                    </h1>
                </div>
                <div>
                    <BackButton :label="isLargeScreen ? '&times;' : 'Cancel'" class="mb-6" :previous-route="false"
                        @update:go-back="handleCloseForm" />
                </div>
            </div>
        </template>

        <!-- <h1 class="text-2xl font-bold text-gray-900 text-center mb-11 hidden md:block"> -->
        <!-- <h1 class="text-2xl font-bold text-gray-900 text-center mb-11">
            {{ homeFormTitle }}
        </h1> -->

        <AnnouncementForm v-if="$route.query.ftype === 'announcement'" :key="String($route.query.fid ?? 'new')"
            @close="handleCloseForm" />
    </MlbModal>

    <FamilyUpdatesModal v-model:show="showAllUpdatesModal" :items="announcements" :loading="loadingAnnouncements"
        @create="handleCreateAnnouncementFromModal" @edit-item="handleEditAnnouncementFromModal"
        @delete-item="handleDeleteAnnouncement" />

    <WelcomeModal v-model:show="showWelcomeModal" />
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useProfileStore } from '@/stores/profile.store'
import { useGeneralStore } from '@/stores/general.store'
import { useAnnouncementStore } from '@/stores/announcement.store'
import { useHome } from '@/composables/useHome'
import { useGetAllMediaQuery } from '@/services/storage.services'
import type { Announcement } from '@/types/announcement.types'

// Content components
import HeroBanner from '@/components/home/v2/HeroBanner.vue'
import UserStatsCard from '@/components/home/v2/UserStatsCard.vue'
import FamilyTreeChecklist from '@/components/home/v2/FamilyTreeChecklist.vue'
import FamilyTreeActions from '@/components/home/v2/FamilyTreeActions.vue'
import FamilyUpdates from '@/components/home/v2/FamilyUpdates.vue'
import FamilyUpdatesModal from '@/components/home/v2/FamilyUpdatesModal.vue'
import WelcomeModal from '@/components/home/v2/WelcomeModal.vue'
import HomeBottomLeftTree from '@/components/home/v2/HomeBottomLeftTree.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import AnnouncementForm from '@/components/home/AnnoucementForm.vue'

const $router = useRouter()
const $route = useRoute()

const showWelcomeModal = ref(false)
const showHomeFormModal = ref(false)
const showAllUpdatesModal = ref(false)
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const profileStore = useProfileStore()
const generalStore = useGeneralStore()
const announcementStore = useAnnouncementStore()
const { fetchAnnouncements, fetchFamilyMembers, deleteAnnouncement } = useHome()
const allMediaQuery = useGetAllMediaQuery(true, 1000)

const user = computed(() => profileStore.userDetails)
const userName = computed(() => user.value?.first_name || 'there')
const familyMembersCount = computed(() => generalStore.familyMembers.length)
const memoriesCount = computed(() => allMediaQuery.data.value?.data?.length ?? 0)
const announcements = computed(() => announcementStore.announcements)
const loadingAnnouncements = computed(() => announcementStore.loading)

const homeFormTitle = computed(() => {
    if ($route.query.ftype === 'announcement') {
        return $route.query.fid ? 'Edit Family Update' : 'New Family Update'
    }
    return ''
})

onMounted(async () => {
    await Promise.all([fetchAnnouncements(), fetchFamilyMembers()])
    if ($route.query.welcome === '1') {
        showWelcomeModal.value = true
        $router.replace({ query: { ...$route.query, welcome: undefined } })
    }
})

watch(
    () => $route.query.ftype,
    (newFtype) => {
        showHomeFormModal.value = newFtype === 'announcement'
    },
    { immediate: true },
)

// ── Navigation handlers ──────────────────────────────────────────────────────

const goToFamilyTree = () => $router.push({ name: 'App.FamilyTreeView' })

const goToStorage = () => $router.push({ name: 'App.StorageFolderView' })

// ── Announcement handlers ────────────────────────────────────────────────────

const handleEditAnnouncement = (item: Announcement) => {
    announcementStore.setStoreProp('selectedAnnouncement', item)
    $router.push({ name: 'App.HomeView', query: { ftype: 'announcement', fid: item.id } })
}

const handleDeleteAnnouncement = (id: number) => deleteAnnouncement(id)

const handleCreateAnnouncement = () => {
    announcementStore.setStoreProp('selectedAnnouncement', null)
    const query = { ...$route.query, ftype: 'announcement' }
    delete (query as Record<string, unknown>).fid
    $router.push({ name: 'App.HomeView', query })
}

const handleCreateAnnouncementFromModal = () => {
    showAllUpdatesModal.value = false
    handleCreateAnnouncement()
}

const handleEditAnnouncementFromModal = (item: Announcement) => {
    showAllUpdatesModal.value = false
    handleEditAnnouncement(item)
}

const handleCloseForm = () => {
    const query = { ...$route.query }
    if (query.ftype) delete query.ftype
    if (query.fid) delete query.fid
    $router.replace({ name: 'App.HomeView', query })
}

const onHomeFormModalShowUpdate = (show: boolean) => {
    if (!show && $route.query.ftype) {
        handleCloseForm()
    }
}
</script>