<template>
  <div class="relative h-full">
    <div v-if="!capsules.length">
      <EmptyComponent
        icon="vuesax.broken.security-time"
        :icon-size="250"
        icon-color="#A1A1A1"
        title="Nothing to see here yet"
      />
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
    />
  </MlbModal>
  <ConfirmationModal
    v-model:show-modal="showConfirmationModal"
    title="Enter Password to Edit"
    description="We know that many things may happen but we hope that you always remember your new password"
    confirm-button-label="Edit Details"
    confirm-button-class="bg-primary-700! text-white!"
    @confirm="handleConfirm"
  >
    <template #content>
      <n-form-item label="Password" path="password">
        <MlbInput
          v-model="password"
          id="password"
          name="password"
          type="password"
          show-password-on="mousedown"
          placeholder="Enter your password"
          custom-class="border-gray-300 focus:border-primary-500"
        />
      </n-form-item>
    </template>
  </ConfirmationModal>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { NButton, NFormItem } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import EmptyComponent from '@/components/common/EmptyComponent.vue'
import type { TimeCapsule } from '@/types/time-capsule.types'
import TimeCapsuleCard from '@/components/time-capsule/TimeCapsuleCard.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import { useRoute, useRouter } from 'vue-router'
import TimeCapsuleView from '@/components/time-capsule/TimeCapsuleView.vue'
import TimeCapsuleForm from '@/components/time-capsule/TimeCapsuleForm.vue'

const $route = useRoute()
const $router = useRouter()

const password = ref<string>('')
const showTimeCapsuleModal = ref<boolean>(false)
const showConfirmationModal = ref<boolean>(false)

const selectedCapsule = ref<TimeCapsule | null>(null)

const capsules = ref<TimeCapsule[]>([
  {
    id: '1',
    title: 'Time Capsule 1',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    media: [
      {
        id: '1',
        name: 'media1.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
      {
        id: '2',
        name: 'media2.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
      {
        id: '3',
        name: 'media3.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
    ],
    open_date: new Date(),
    family_members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://ui-avatars.com/api/?rounded=true&name=John Doe',
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        avatar: 'https://ui-avatars.com/api/?rounded=true&name=Jane Doe',
      },
    ],
  },
  {
    id: '2',
    title: 'Time Capsule 2',
    description: 'Time Capsule 2 description',
    body: 'Time Capsule 2 body',
    media: [
      {
        id: '1',
        name: 'media1.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
      {
        id: '2',
        name: 'media2.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
    ],
    open_date: new Date(),
    family_members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://ui-avatars.com/api/?rounded=true&name=John Doe',
      },
    ],
  },
  {
    id: '3',
    title: 'Time Capsule 3',
    description: 'Time Capsule 3 description',
    body: 'Time Capsule 3 body',
    media: [
      {
        id: '1',
        name: 'media1.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
      {
        id: '2',
        name: 'media2.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
    ],
    open_date: new Date('2025-12-15'),
    family_members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://ui-avatars.com/api/?rounded=true&name=John Doe',
      },
    ],
  },
  {
    id: '4',
    title: 'Time Capsule 4',
    description: 'Time Capsule 4 description',
    body: 'Time Capsule 4 body',
    media: [
      {
        id: '1',
        name: 'media1.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
      {
        id: '2',
        name: 'media2.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
    ],
    open_date: new Date(),
    family_members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://ui-avatars.com/api/?rounded=true&name=John Doe',
      },
    ],
  },
  {
    id: '5',
    title: 'Time Capsule 5',
    description: 'Time Capsule 5 description',
    body: 'Time Capsule 5 body',
    media: [
      {
        id: '1',
        name: 'media9.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
      {
        id: '2',
        name: 'media10.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
    ],
    open_date: new Date(),
    family_members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://ui-avatars.com/api/?rounded=true&name=John Doe',
      },
    ],
  },
  {
    id: '6',
    title: 'Time Capsule 6',
    description: 'Time Capsule 6 description',
    body: 'Time Capsule 6 body',
    media: [
      {
        id: '1',
        name: 'media1.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
      {
        id: '2',
        name: 'media2.jpg',
        type: 'image',
        status: 'finished',
        url: 'https://picsum.photos/200/300?grayscale',
      },
    ],
    open_date: new Date(),
    family_members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://ui-avatars.com/api/?rounded=true&name=John Doe',
      },
    ],
  },
])

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

const handleConfirm = () => {
  console.log('cancel')
  showConfirmationModal.value = false
}

const handleSelectCapsule = (value: { capsule: TimeCapsule; key: string }) => {
  selectedCapsule.value = value.capsule
  if (value.key === 'delete') {
    showConfirmationModal.value = true
  } else {
    showTimeCapsuleModal.value = true
  }
}

const handleCreateCapsule = () => {
  $router.push({ name: 'App.TimeCapsules.Create' })
}

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
