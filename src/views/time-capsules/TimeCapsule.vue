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
    <div v-else>
      <div class="sticky top-0 z-10 bg-white md:hidden">
        <div class="flex justify-between items-center mb-6 mt-3 py-3">
          <BackButton label="" icon="vuesax.linear.arrow-left" class="mb-6" />
          <div>Time Capsule</div>
          <div>
            <MlbIcon
              name="vuesax.linear.add"
              color="#333333"
              :size="24"
              @click.prevent="handleCreateCapsule(1)"
            />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
        <TimeCapsuleCard
          v-for="capsule in capsules"
          :key="capsule.id"
          :capsule="capsule"
          @select:option="handleSelectCapsule"
        />
      </div>
    </div>
  </div>
  <div class="hidden md:block absolute bottom-10 right-10">
    <n-button
      id="time-capsules-tour-step-2"
      class="rounded-full! bg-primary-500! text-white! w-20! h-20! shadow-[0px_6.33px_31.67px_0px_#16C4504D]!"
      @click="handleCreateCapsule()"
    >
      <template #icon>
        <MlbIcon name="vuesax.linear.add" :size="40" color="#ffffff" />
      </template>
    </n-button>
  </div>
  <MlbModal
    v-model:show="showTimeCapsuleModal"
    :class="modalClass"
    :full-page="
      !isLargeScreen && ($route.params.step == '1' || $route.name == 'App.TimeCapsules.Details')
    "
    :bottom-sheet="!isLargeScreen && $route.params.step == '2'"
    :bottom-sheet-height="504"
    @mask-click="handleMaskClick"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <BackButton
          :label="isLargeScreen ? 'Go back' : ''"
          icon="vuesax.linear.arrow-left"
          class="mb-6"
          @update:go-back="handleGoBack"
        />
        <div
          :class="[
            'md:hidden',
            { 'text-sm': $route.params.step == '1' },
            {
              'text-base font-semibold':
                $route.params.step == '2' || $route.name == 'App.TimeCapsules.Details',
            },
          ]"
        >
          {{ timeCapsuleModalOptions?.title }}
        </div>
        <div>
          <div
            :class="[
              'md:hidden',
              {
                hidden:
                  $route.params.step == '2' ||
                  (selectedCapsule?.open_at && new Date(selectedCapsule.open_at) > new Date()),
              },
            ]"
          >
            <MlbButton
              text
              :label="$route.name == 'App.TimeCapsules.Details' ? 'Edit' : 'Save'"
              @click="
                $route.name == 'App.TimeCapsules.Details'
                  ? $router.push({
                      name: 'App.TimeCapsules.Edit',
                      params: { id: selectedCapsule?.id, step: '1' },
                    })
                  : handleCreateCapsule(2)
              "
            >
              <template #icon>
                <MlbIcon
                  class="mr-2"
                  :name="
                    $route.name == 'App.TimeCapsules.Details'
                      ? 'vuesax.linear.edit-2'
                      : 'vuesax.linear.save-2'
                  "
                  :size="16"
                  color="#ffffff"
                />
              </template>
            </MlbButton>
          </div>
        </div>
      </div>
    </template>

    <h1
      v-if="timeCapsuleModalOptions?.title"
      class="text-2xl font-bold text-gray-900 text-center mb-11 hidden md:block"
    >
      {{ timeCapsuleModalOptions?.title }}
    </h1>
    <component
      v-if="timeCapsuleModalOptions?.component"
      ref="timeCapsuleModalFormRef"
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
import { useTour } from '@/composables/useTour'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useTimeCapsuleStore } from '@/stores/time-capsule.store'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const { startTour } = useTour()
const getTimeCapsules = useGetTimeCapsulesQuery()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const timeCapsuleStore = useTimeCapsuleStore()

const loading = ref<boolean>(false)
const showTimeCapsuleModal = ref<boolean>(false)
const capsules = ref<TimeCapsuleInterface[]>([])
const timeCapsuleModalFormRef = ref<InstanceType<typeof TimeCapsuleForm> | null>(null)

const selectedCapsule = computed<TimeCapsuleInterface | null>(
  () => timeCapsuleStore.selectedTimeCapsule,
)

const modalClass = computed(() => {
  return {
    'rounded-3xl!': isLargeScreen.value,
    'rounded-none!':
      !isLargeScreen.value &&
      ($route.params.step == '1' || $route.name == 'App.TimeCapsules.Details'),
  }
})

const timeCapsuleModalOptions = computed(() => {
  return (
    {
      'App.TimeCapsules.Details': {
        title: isLargeScreen.value ? undefined : selectedCapsule.value?.title,
        key: 'view',
        component: TimeCapsuleView,
      },
      'App.TimeCapsules.Delete': {
        key: 'delete',
      },
      'App.TimeCapsules.Edit': {
        title: isLargeScreen.value
          ? 'Edit Time Capsule'
          : $route.params.step == '1'
            ? 'Time Capsule'
            : 'Save Time Capsule',
        key: 'edit',
        component: TimeCapsuleForm,
      },
      'App.TimeCapsules.Create': {
        title: isLargeScreen.value
          ? 'Add Time Capsule'
          : $route.params.step == '1'
            ? 'Time Capsule'
            : 'Save Time Capsule',
        key: 'create',
        component: TimeCapsuleForm,
      },
    }[$route.name as string] ?? null
  )
})

const handleSelectCapsule = async (value: { capsule: TimeCapsuleInterface; key: string }) => {
  timeCapsuleStore.setStoreProp('selectedTimeCapsule', value.capsule)
  if (value.key === 'edit') {
    showTimeCapsuleModal.value = true
  }
  await fetchTimeCapsules()
}

const handleCreateCapsule = (step?: number) => {
  if (isLargeScreen.value) {
    $router.push({ name: 'App.TimeCapsules.Create' })
    return
  }
  if (
    step == 2 &&
    $route.name == 'App.TimeCapsules.Create' &&
    (!timeCapsuleModalFormRef.value?.form.title ||
      !timeCapsuleModalFormRef.value?.form.description ||
      timeCapsuleModalFormRef.value?.form.files.length === 0)
  ) {
    message.error('Please fill in all required fields.')
    return
  }
  if (
    step == 2 &&
    $route.name == 'App.TimeCapsules.Edit' &&
    (!timeCapsuleModalFormRef.value?.form.title || !timeCapsuleModalFormRef.value?.form.description)
  ) {
    message.error('Please fill in all required fields.')
    return
  }
  $router.push({ name: 'App.TimeCapsules.Create', params: { step: String(step ?? 1) } })
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

const handleMaskClick = () => {
  showTimeCapsuleModal.value = false
  $router.replace({ name: 'App.TimeCapsules.View' })
}

const handleGoBack = () => {
  if ($route.params.step == '2') {
    $router.replace({ name: 'App.TimeCapsules.Create', params: { step: '1' } })
    return
  }
  $router.replace({ name: 'App.TimeCapsules.View' })
}

onMounted(async () => {
  await fetchTimeCapsules()
  startTour('time-capsules')
  timeCapsuleStore.setStoreProp('selectedTimeCapsule', null)
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

watch(
  () => $route.params.step,
  (newStep) => {
    const newForm = timeCapsuleModalFormRef.value?.form
    if (
      !isLargeScreen.value &&
      $route.name == 'App.TimeCapsules.Create' &&
      newStep == '2' &&
      !newForm?.title &&
      !newForm?.description &&
      !newForm?.files.length
    ) {
      $router.replace({ name: 'App.TimeCapsules.Create', params: { step: '1' } })
    }
  },
  { immediate: true },
)
</script>
