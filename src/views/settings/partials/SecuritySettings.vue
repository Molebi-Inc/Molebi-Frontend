<template>
  <section class="flex flex-col gap-5">
    <h1 class="hidden md:block text-base font-semibold text-gray-700 mb-5">Security</h1>

    <div v-if="!activeItem" class="flex flex-col gap-0 mt-6 md:mt-0">
      <button
        v-for="item in securityItems"
        :key="item.id || 'item'"
        class="w-full flex items-center gap-4 py-4 text-left transition-colors hover:shadow-sm border-b border-gray-100 last:border-b-0"
        :class="activeItem === item.id ? 'bg-gray-50 shadow-sm' : ''"
        @click="handleItemClick(item.id)"
      >
        <span
          class="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 bg-gray-100"
        >
          <MlbIcon :name="item.icon" :color="'fill-gray-500'" />
        </span>
        <div class="flex-1">
          <p class="text-sm text-gray-700">{{ item.label }}</p>
          <p class="text-xs text-gray-500" v-if="item.description">{{ item.description }}</p>
        </div>
        <span class="text-gray-400 text-xl">›</span>
      </button>
    </div>

    <div v-if="activeComponent" class="mt-4">
      <div class="flex justify-end">
        <MlbButton
          text
          class="text-gray-700! font-medium! mb-4!"
          label="Cancel"
          @click="handleItemClick(null)"
        />
      </div>
      <component
        :is="activeComponent"
        :key="activeItem"
        :mode="activeItem === 'change-password' ? 'change' : undefined"
        :on-success="handleSuccess"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue'
// import ChangePinForm from '@/components/settings/ChangePinForm.vue'
import type { SecurityItem, SecurityItemId } from '@/types/settings.types'

const activeItem = ref<SecurityItemId>(null)

const securityItems: SecurityItem[] = [
  {
    id: 'change-password',
    label: 'Change Password',
    description: 'Update your current password',
    icon: 'icon.moon.profile-light',
    component: ChangePasswordForm,
  },
  // {
  //   id: 'change-pin',
  //   label: 'Change Vault Pin',
  //   description: 'Update your vault pin',
  //   icon: 'vault',
  //   component: ChangePinForm,
  // },
]

const activeComponent = computed(() => {
  return securityItems.find((item) => item.id === activeItem.value)?.component
})

const handleItemClick = (id: SecurityItemId) => {
  activeItem.value = activeItem.value === id ? null : id
}

const handleSuccess = () => {
  activeItem.value = null
}
</script>
