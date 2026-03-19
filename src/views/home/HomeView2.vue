<template>
    <main class="flex-1 bg-transparent">
        <!-- Desktop: two-column layout -->
        <div class="hidden md:flex gap-6 max-w-[1200px] mx-auto px-10 py-8">
            <!-- Left sidebar: user card + tree illustration -->
            <aside class="w-[300px] flex-shrink-0 space-y-6">
                <UserStatsCard :user="user" :family-members-count="familyMembersCount" :memories-count="0"
                    @add-members="goToFamilyTree" @add-memories="goToStorage" />
                <div class="flex justify-center">
                    <!-- <img src="@/assets/svg/tree-3.svg" alt="Family tree illustration"
                            class="w-full max-w-[260px]" /> -->
                    <HomeBottomLeftTree />
                </div>
            </aside>

            <!-- Right: main content stack -->
            <div class="flex-1 min-w-0 space-y-5">
                <HeroBanner @try-now="goToVault" />
                <FamilyTreeChecklist :user-name="userName" @add-relative="goToFamilyTree" />
                <FamilyUpdates :items="announcements" :loading="loadingAnnouncements" @create="handleCreateAnnouncement"
                    @view-all="handleCreateAnnouncement" @edit-item="handleEditAnnouncement"
                    @delete-item="handleDeleteAnnouncement" />
            </div>
        </div>

        <!-- Mobile: single-column layout -->
        <div class="md:hidden bg-white px-4 pt-5 pb-24 space-y-4">
            <p class="text-sm text-neutral-600">
                Welcome back 👋 <strong class="text-neutral-900">{{ userName }}</strong>
            </p>
            <HeroBanner @try-now="goToVault" />
            <FamilyTreeChecklist :user-name="userName" @add-relative="goToFamilyTree" />
            <FamilyTreeActions @add-relative="goToFamilyTree" @add-memory="goToStorage"
                @explore-culture="$router.push({ name: 'App.Heritage' })" />
            <FamilyUpdates :items="announcements" :loading="loadingAnnouncements" @create="handleCreateAnnouncement"
                @view-all="handleCreateAnnouncement" @edit-item="handleEditAnnouncement"
                @delete-item="handleDeleteAnnouncement" />
        </div>
    </main>

    <WelcomeModal v-model:show="showWelcomeModal" />
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import { useGeneralStore } from '@/stores/general.store'
import { useAnnouncementStore } from '@/stores/announcement.store'
import { useHome } from '@/composables/useHome'
import type { Announcement } from '@/types/announcement.types'

// Content components
import HeroBanner from '@/components/home/v2/HeroBanner.vue'
import UserStatsCard from '@/components/home/v2/UserStatsCard.vue'
import FamilyTreeChecklist from '@/components/home/v2/FamilyTreeChecklist.vue'
import FamilyTreeActions from '@/components/home/v2/FamilyTreeActions.vue'
import FamilyUpdates from '@/components/home/v2/FamilyUpdates.vue'
import WelcomeModal from '@/components/home/v2/WelcomeModal.vue'
import HomeBottomLeftTree from '@/components/home/v2/HomeBottomLeftTree.vue'

const $router = useRouter()
const $route = useRoute()

const showWelcomeModal = ref(false)
const profileStore = useProfileStore()
const generalStore = useGeneralStore()
const announcementStore = useAnnouncementStore()
const { fetchAnnouncements, fetchFamilyMembers, deleteAnnouncement } = useHome()

const user = computed(() => profileStore.userDetails)
const userName = computed(() => user.value?.first_name || 'there')
const familyMembersCount = computed(() => generalStore.familyMembers.length)
const announcements = computed(() => announcementStore.announcements)
const loadingAnnouncements = computed(() => announcementStore.loading)

onMounted(async () => {
    await Promise.all([fetchAnnouncements(), fetchFamilyMembers()])
    if ($route.query.welcome === '1') {
        showWelcomeModal.value = true
        $router.replace({ query: { ...$route.query, welcome: undefined } })
    }
})

// ── Navigation handlers ──────────────────────────────────────────────────────

const goToFamilyTree = () => $router.push({ name: 'App.FamilyTreeView' })

const goToStorage = () => $router.push({ name: 'App.StorageLayout' })

const goToVault = () => $router.push({ name: 'App.VaultView' })

// ── Announcement handlers ────────────────────────────────────────────────────

const handleEditAnnouncement = (item: Announcement) => {
    announcementStore.setStoreProp('selectedAnnouncement', item)
    $router.push({ name: 'App.HomeView', query: { ftype: 'announcement', fid: item.id } })
}

const handleDeleteAnnouncement = (id: number) => deleteAnnouncement(id)

const handleCreateAnnouncement = () => {
    $router.push({ name: 'App.HomeView', query: { ftype: 'announcement' } })
}
</script>