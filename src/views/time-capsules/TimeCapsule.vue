<template>
  <div class="relative h-full">
    <div v-if="!capsules.length && !loading">
      <EmptyComponent
        icon="vuesax.broken.security-time"
        :icon-size="250"
        icon-color="#A1A1A1"
        title="Nothing to see here yet"
      />
    </div>
    <div v-else-if="loading && !capsules.length">
      <SkeletalLoader :rows="2" :columns="isLargeScreen ? 5 : 2" :gap="4" height="160px" />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
      <TimeCapsuleCard
        v-for="capsule in capsules"
        :key="capsule.id"
        :capsule="capsule"
        @select:option="handleSelectCapsule"
      />
    </div>
  </div>
  <div class="absolute bottom-10 right-10">
    <n-button
      class="rounded-full! bg-primary-500! text-white! w-20! h-20! shadow-[0px_6.33px_31.67px_0px_#16C4504D]!"
      @click="handleCreateCapsule"
    >
      <template #icon>
        <MlbIcon name="vuesax.linear.add" :size="40" color="#ffffff" />
      </template>
    </n-button>
  </div>
  <MlbModal v-model:show="showTimeCapsuleModal" class="rounded-3xl!">
    <template #header>
      <div>
        <BackButton icon="vuesax.linear.arrow-left" class="mb-6" />
      </div>
    </template>

    <h1
      v-if="timeCapsuleModalOptions?.title"
      class="text-2xl font-bold text-gray-900 text-center mb-11"
    >
      {{ timeCapsuleModalOptions?.title }}
    </h1>
    <component
      v-if="timeCapsuleModalOptions?.component"
      :is="timeCapsuleModalOptions?.component"
      :key="timeCapsuleModalOptions?.key"
      :capsule="selectedCapsule ?? undefined"
      @close="showTimeCapsuleModal = false"
      @submit="fetchTimeCapsules"
    />
  </MlbModal>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { NButton, useMessage } from 'naive-ui'
import EmptyComponent from '@/components/common/EmptyComponent.vue'
import type { TimeCapsuleInterface } from '@/types/time-capsule.types'
import TimeCapsuleCard from '@/components/time-capsule/TimeCapsuleCard.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import { useRoute, useRouter } from 'vue-router'
import TimeCapsuleView from '@/components/time-capsule/TimeCapsuleView.vue'
import TimeCapsuleForm from '@/components/time-capsule/TimeCapsuleForm.vue'
import { useGetTimeCapsulesQuery } from '@/services/time-capsule.services'
import SkeletalLoader from '@/components/common/SkeletalLoader.vue'
import { useMediaQuery } from '@vueuse/core'
import { handleApiError } from '@/helpers/error.helpers'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const getTimeCapsules = useGetTimeCapsulesQuery()

const loading = ref<boolean>(false)
const showTimeCapsuleModal = ref<boolean>(false)

const selectedCapsule = ref<TimeCapsuleInterface | null>(null)

const capsules = ref<TimeCapsuleInterface[]>([])

const timeCapsuleModalOptions = computed(() => {
  return (
    {
      'App.TimeCapsules.Details': {
        key: 'view',
        component: TimeCapsuleView,
      },
      'App.TimeCapsules.Delete': {
        key: 'delete',
      },
      'App.TimeCapsules.Edit': {
        title: 'Edit Time Capsule',
        key: 'edit',
        component: TimeCapsuleForm,
      },
      'App.TimeCapsules.Create': {
        title: 'Add Time Capsule',
        key: 'create',
        component: TimeCapsuleForm,
      },
    }[$route.name as string] ?? null
  )
})

const handleSelectCapsule = async (value: { capsule: TimeCapsuleInterface; key: string }) => {
  selectedCapsule.value = value.capsule
  if (value.key === 'edit') {
    showTimeCapsuleModal.value = true
  }
  await fetchTimeCapsules()
}

const handleCreateCapsule = () => {
  $router.push({ name: 'App.TimeCapsules.Create' })
}

const fetchTimeCapsules = async () => {
  loading.value = true
  try {
    const response = await getTimeCapsules.refetch()
    capsules.value = response.data?.data ?? []
  } catch (error) {
    handleApiError(error, message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchTimeCapsules()
})

watch(
  () => $route.name,
  (newName) => {
    if (
      ['App.TimeCapsules.Details', 'App.TimeCapsules.Edit', 'App.TimeCapsules.Create'].includes(
        newName as string,
      )
    ) {
      showTimeCapsuleModal.value = true
    } else {
      showTimeCapsuleModal.value = false
    }
  },
  { immediate: true },
)
</script>
