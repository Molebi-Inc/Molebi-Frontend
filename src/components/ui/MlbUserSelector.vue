<template>
  <NSelect
    :value="modelValue"
    multiple
    filterable
    :options="selectOptions"
    :placeholder="placeholder"
    :disabled="disabled"
    :render-label="renderLabel"
    :render-tag="renderMultipleSelectTag"
    @update:value="onUpdateValue"
  />
</template>

<script setup lang="ts">
import type { SelectRenderLabel, SelectRenderTag } from 'naive-ui'
import { NAvatar, NTag, NSelect, NText } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { computed, h } from 'vue'
import type { FamilyMemberInterface } from '@/types/family-tree.types'

export type FamilyMemberSelectOption = SelectOption & {
  member: FamilyMemberInterface
}

const props = withDefaults(
  defineProps<{
    familyMembers: FamilyMemberInterface[]
    modelValue: number[]
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: 'Select family members',
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

function memberDisplayName(m: FamilyMemberInterface): string {
  const full = m.full_name?.trim()
  if (full) return full
  return [m.first_name, m.family_name].filter(Boolean).join(' ').trim() || 'Member'
}

function memberInitials(m: FamilyMemberInterface): string {
  const a = m.first_name?.trim().charAt(0) ?? ''
  const b = m.family_name?.trim().charAt(0) ?? ''
  const pair = `${a}${b}`.toUpperCase()
  if (pair) return pair
  const fromFull = m.full_name?.trim().slice(0, 2).toUpperCase()
  return fromFull || '?'
}

function memberSubtitle(m: FamilyMemberInterface): string {
  if (m.nickname?.trim()) return m.nickname.trim()
  const rel = m.relationship_metadata?.relation_type
  if (rel) return rel.replace(/_/g, ' ')
  return m.email?.trim() ?? ''
}

function renderMemberAvatar(member: FamilyMemberInterface, pixelSize: number, marginRight?: string) {
  const url = member.profile_picture_url?.trim()
  const style = marginRight ? { marginRight } : undefined
  if (url) {
    return h(NAvatar, {
      round: true,
      size: pixelSize,
      src: url,
      style,
    })
  }
  return h(
    NAvatar,
    {
      round: true,
      size: pixelSize,
      color: '#e5e7eb',
      style: { color: '#374151', ...style },
    },
    { default: () => memberInitials(member) },
  )
}

const selectOptions = computed<FamilyMemberSelectOption[]>(() =>
  props.familyMembers
    .filter((m): m is FamilyMemberInterface & { id: number } => m.id != null)
    .map((m) => ({
      label: memberDisplayName(m),
      value: m.id,
      member: m,
    })),
)

const onUpdateValue = (value: number[]) => {
  emit('update:modelValue', value)
}

const renderLabel: SelectRenderLabel = (option) => {
  const opt = option as FamilyMemberSelectOption
  const member = opt.member
  if (!member) {
    return h('span', null, String(option.label ?? ''))
  }
  const subtitle = memberSubtitle(member)
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    [
      renderMemberAvatar(member, 28),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0',
          },
        },
        [
          h('div', null, [memberDisplayName(member)]),
          subtitle
            ? h(
                NText,
                { depth: 3, tag: 'div', style: { fontSize: '12px', marginTop: '2px' } },
                { default: () => subtitle },
              )
            : null,
        ].filter(Boolean),
      ),
    ],
  )
}

const renderMultipleSelectTag: SelectRenderTag = ({ option, handleClose }) => {
  const opt = option as FamilyMemberSelectOption
  const member = opt.member
  const label = member ? memberDisplayName(member) : String(opt.label ?? '')
  return h(
    NTag,
    {
      style: {
        padding: '0 6px 0 4px',
      },
      round: true,
      closable: true,
      onClose: (e: MouseEvent) => {
        e.stopPropagation()
        handleClose()
      },
    },
    {
      default: () =>
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
            },
          },
          [
            member ? renderMemberAvatar(member, 22, '4px') : null,
            label,
          ].filter(Boolean),
        ),
    },
  )
}
</script>
