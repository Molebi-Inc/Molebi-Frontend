<template>
  <NGAvatarGroup :options="avatarOptions" :size="40" :max="3">
    <template #avatar="{ option: { name, src } }">
      <n-tooltip>
        <template #trigger>
          <n-avatar :src="src" />
        </template>
        {{ name }}
      </n-tooltip>
    </template>
    <template #rest="{ options: restOptions, rest }">
      <n-dropdown :options="createDropdownOptions(restOptions)" placement="top">
        <n-avatar>+{{ rest }}</n-avatar>
      </n-dropdown>
    </template>
  </NGAvatarGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NTooltip, NAvatar, NDropdown } from 'naive-ui'
import type { AvatarGroupOption } from 'naive-ui'
import { NGAvatarGroup } from 'naive-ui/generic'

type Option = AvatarGroupOption & { name: string }

interface AvatarOption {
  firstname_field: string
  lastname_field?: string
  src_field?: string
  users: Record<string, any>[] | Record<string, any>
}
interface Props {
  options: AvatarOption
  max?: number
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  max: 1,
  size: 40,
})

const createDropdownOptions = (options: Option[]) => {
  return options.map((option) => ({
    label: option.name,
    key: option.src as string,
  }))
}

const avatarOptions = computed(() => {
  return Array.isArray(props.options.users)
    ? props.options.users.map((user) => ({
        name: handleUserFormatting(user).name,
        src: handleUserFormatting(user).src,
      }))
    : [
        {
          name: handleUserFormatting(props.options.users).name,
          src: handleUserFormatting(props.options.users).src,
        },
      ]
})

const handleUserFormatting = (user: Record<string, any>): { name: string, src: string } => {
  const firstName = user[props.options.firstname_field as keyof typeof user]
  const familyName = props.options.lastname_field ? user[props.options.lastname_field as keyof typeof user] : undefined
  const name = `${firstName ?? ''} ${familyName ?? ''}`.trim()
  const hasName = Boolean(firstName || familyName)
  const fallbackName = hasName ? `${firstName ?? ''} ${familyName ?? ''}`.trim() : 'Molebi User'
  const encodedName = encodeURIComponent(fallbackName)
  const src = props.options.src_field ? user[props.options.src_field as keyof typeof user] : `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=${props.size}`
  return { name, src }
}
</script>
