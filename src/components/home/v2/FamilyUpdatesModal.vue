<script setup lang="ts">
import { NSpin } from 'naive-ui'
import { useMediaQuery } from '@vueuse/core'
import { computed, ref, onMounted } from 'vue'
import { useHome } from '@/composables/useHome'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import FamilyUpdateItem from './FamilyUpdateItem.vue'
import { useGeneralStore } from '@/stores/general.store'
import { useProfileStore } from '@/stores/profile.store'
import BackButton from '@/components/common/BackButton.vue'
import type { Announcement } from '@/types/announcement.types'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import { announcementValidation } from '@/validations/dashboard.validations'
import MlbUserSelector from '@/components/ui/MlbUserSelector.vue'

const props = defineProps<{
  show: boolean
  items: Announcement[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'edit-item', item: Announcement): void
  (e: 'delete-item', id: number): void
}>()

const hasItems = computed(() => props.items.length > 0)
const isMobile = useMediaQuery('(max-width: 768px)')

const showForm = ref(false)
const showMemberSelector = ref(false)
const profileStore = useProfileStore()
const generalStore = useGeneralStore()
const { loading: submitting, createAnnouncement, fetchFamilyMembers } = useHome()
const { form } = announcementValidation()

const userAvatar = computed(() => profileStore.userDetails?.avatar)

const familyMembers = computed<FamilyMemberInterface[]>(() => generalStore.familyMembers)

const toggleForm = () => {
  showForm.value = !showForm.value
}

const updateForm = (value: number[]) => {
  form.value.member_ids = value
}

const handlePost = async () => {
  if (!form.value.title.trim()) return
  await createAnnouncement(form.value)
  form.value = { title: '', content: '', member_ids: [], create_reminder: true }
  showForm.value = false
  showMemberSelector.value = false
}

const handleClose = () => {
  showForm.value = false
  emit('update:show', false)
}

onMounted(() => {
  fetchFamilyMembers()
})
</script>

<template>
  <MlbModal :show="show" :max-width="720" :bottom-sheet="isMobile" :bottom-sheet-height="500" class="rounded-3xl!"
    @update:show="handleClose">
    <template #header>
      <div class="flex items-center gap-1">
        <BackButton label="" icon="vuesax.linear.arrow-left" :icon-size="14" :previous-route="false"
          @update:go-back="handleClose" />
        <h3 class="text-base font-semibold text-neutral-900">Family Updates</h3>
      </div>
    </template>

    <!-- Add update button -->
    <div class="mb-4">
      <button
        class="px-3 text-base rounded-xl bg-primary text-white font-semibold hover:bg-primary-800 transition-colors cursor-pointer w-full py-4"
        @click="toggleForm">
        {{ showForm ? 'Cancel' : '+ Add a New Family Update' }}
      </button>
    </div>

    <!-- Inline create form -->
    <div v-if="showForm" class="mb-5 overflow-hidden">
      <div class="flex gap-2 py-4">
        <img v-if="userAvatar" :src="userAvatar" alt="Avatar" class="w-10 h-10 rounded-full object-cover shrink-0" />
        <div v-else
          class="w-10 h-10 rounded-full bg-primary-100 shrink-0 flex items-center justify-center text-primary-700 font-semibold text-sm">
          {{ profileStore.userDetails?.first_name?.[0] ?? 'U' }}
        </div>
        <div class="flex-1 min-w-0 px-4 bg-neutral-50 rounded-xl">
          <input v-model="form.title" type="text" placeholder="Add a Title.."
            class="w-full bg-transparent text-base font-semibold text-gray-900 placeholder-gray-400 outline-none mb-2 title-input" />
          <textarea v-model="form.content" placeholder="What is your update" rows="3"
            class="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none" />
        </div>
      </div>
      <div v-if="showMemberSelector" class="mb-1">
        <MlbUserSelector :family-members="familyMembers" :model-value="form.member_ids"
          @update:model-value="updateForm" />
      </div>
      <div class="flex items-center gap-2 px-4 py-3 border-t border-neutral-200">
        <!-- <button
          class="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary px-3 py-2 rounded-3xl hover:bg-primary-800 transition-colors cursor-pointer">
          <MlbIcon name="attachment" :size="14" color="white" />
          <span class="hidden md:block">
            Add File
          </span>
        </button> -->
        <button
          class="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary px-3 py-2 rounded-3xl hover:bg-primary-800 transition-colors cursor-pointer"
          @click="showMemberSelector = !showMemberSelector">
          <MlbIcon name="tag" :size="14" color="white" />
          <span class="hidden md:block">
            Tag Family
          </span>
        </button>
        <button
          class="ml-auto bg-primary hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-3xl transition-colors cursor-pointer"
          :disabled="!form.title.trim() || !!submitting" @click="handlePost">
          {{ submitting ? 'Posting...' : 'post' }}
        </button>
      </div>
    </div>

    <!-- Updates list -->
    <div class="max-h-[55vh] overflow-y-auto pr-1">
      <div v-if="loading" class="flex justify-center py-10">
        <NSpin :show="true" />
      </div>

      <div v-else-if="!hasItems" class="text-center py-8">
        <p class="text-sm text-neutral-400 mb-5">No family updates yet.</p>
      </div>

      <div v-else class="space-y-3">
        <FamilyUpdateItem v-for="item in items" :key="item.id" :item="item" @edit="emit('edit-item', $event)"
          @delete="emit('delete-item', $event)" />
      </div>
    </div>
  </MlbModal>
</template>
<style scoped>
.title-input {
  font-size: 24px !important;
  font-weight: 700 !important;
  color: #1f1f1f !important;
  line-height: 150% !important;
  font-family: Gentium Basic;
}
</style>