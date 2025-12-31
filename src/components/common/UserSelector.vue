<template>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium text-gray-500">{{ label }}</label>

    <!-- Search Input -->
    <div class="relative">
      <NInput
        v-model:value="userSearch"
        placeholder="Select Family"
        class="w-full"
        size="large"
        @focus="userSelectorDropdown = true"
        @blur="handleUserSelectorBlur"
      >
        <template #suffix>
          <MlbIcon name="vuesax.linear.add" :size="16" />
        </template>
      </NInput>

      <!-- Family Member Dropdown -->
      <div
        v-if="userSelectorDropdown"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-3 px-2"
      >
        <div v-if="filteredUsers.length > 0" class="mt-3 flex flex-col gap-3">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 bg-gray-50 rounded-lg"
            @click="addUser(user)"
          >
            <NAvatar :src="getUserAvatar(user)" round :size="40" />
            <div class="flex-1">
              <p class="font-semibold text-gray-900">
                {{ getUserDisplayName(user) }}
              </p>
            </div>
            <MlbIcon name="vuesax.broke.add-square" :size="20" class="text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Family Members Avatars -->
    <div v-if="selectedUserIds.length > 0" class="flex items-center gap-2 flex-wrap mt-2">
      <div v-for="memberId in selectedUserIds" :key="memberId" class="relative">
        <NAvatar
          :src="getUserAvatar(getUserById(memberId))"
          round
          :size="40"
          class="border-2 border-white"
        />
        <button
          @click="removeUser(memberId)"
          class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NAvatar } from 'naive-ui'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import MlbIcon from '@/components/ui/MlbIcon.vue'

export interface UserSelectorOptions {
  form_user_ids_field: string
  search_fields: string[]
  avatar_field: string
  name_fields: string[]
}

const props = defineProps<{
  label: string
  form: Record<string, unknown>
  users: Array<FamilyMemberInterface>
  options: UserSelectorOptions
}>()

const emit = defineEmits<{
  (e: 'update:selected-users', value: number[]): void
}>()

const userSearch = ref<string>('')
const userSelectorDropdown = ref<boolean>(false)

const selectedUserIds = computed(() => {
  const fieldValue = props.form[props.options.form_user_ids_field]
  return Array.isArray(fieldValue) ? (fieldValue as number[]) : []
})

const filteredUsers = computed(() => {
  const fieldValue = props.form[props.options.form_user_ids_field] as number[] | undefined
  const selectedIds = fieldValue || []

  if (!userSearch.value) {
    return props.users.filter(
      (user) => !selectedIds.some((selected: string | number) => selected === user.id),
    )
  }
  return props.users.filter(
    (user) =>
      !selectedIds.some((selected: string | number) => selected === user.id) &&
      props.options.search_fields.some((field: string) => {
        const fieldValue = user[field as keyof typeof user]
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(userSearch.value.toLowerCase())
        }
        return false
      }),
  )
})

const removeUser = (userId: number) => {
  const field = props.options.form_user_ids_field
  const fieldValue = props.form[field] as number[] | undefined
  if (fieldValue && Array.isArray(fieldValue)) {
    emit(
      'update:selected-users',
      fieldValue.filter((m: number) => m !== userId),
    )
  }
}

const getUserById = (id: number) => {
  return props.users.find((m) => m.id === id)
}

const getUserAvatar = (user: (typeof props.users)[number] | undefined): string => {
  if (!user) return ''
  const profilePic = user[props.options.avatar_field as keyof typeof user] as string | undefined
  const nameFields = props.options.name_fields
    .map((field: string) => user[field as keyof typeof user] as string | undefined)
    .filter(Boolean)
  return profilePic || `https://ui-avatars.com/api/?name=${nameFields.join(' ')}&background=random`
}

const getUserDisplayName = (user: (typeof props.users)[number]): string => {
  const nameFields = props.options.name_fields
    .map((field: string) => user[field as keyof typeof user] as string | undefined)
    .filter(Boolean)
  return nameFields.join(' ').trim()
}

const addUser = (user: (typeof props.users)[number]): void => {
  const field = props.options.form_user_ids_field
  const fieldValue = props.form[field] as number[] | undefined
  const currentValue = fieldValue || []
  if (user.id && !currentValue.some((m: number) => m === user.id)) {
    emit('update:selected-users', [...currentValue, user.id])
    userSearch.value = ''
    userSelectorDropdown.value = false
  }
}

const handleUserSelectorBlur = () => {
  // Delay to allow click events to fire first
  setTimeout(() => {
    userSelectorDropdown.value = false
  }, 200)
}
</script>
