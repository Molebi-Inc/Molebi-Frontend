import { z } from 'zod'
import { ref } from 'vue'
import type { FormItemRule } from 'naive-ui'
import type { FamilyMemberFormValues, FamilyRequestFormValues } from '@/types/family-tree.types'
import { useMemberForm } from '@/composables/member-form.composables'

export const familyMemberValidation = () => {
  const form = ref<FamilyMemberFormValues>({
    first_name: '',
    middle_name: '',
    family_name: '',
    is_same_family_name: false,
    nickname: '',
    relation_type: null,
    profile_picture: null,
    gender: 'male',
    related_through: null,
    parent_id: null,
    is_adoptive: false,
    is_former: false,
    is_deceased: false,
    date_of_birth: null,
  })

  const { relationshipsRequiringRelatedThrough, relationshipsRequiringParentId, getDefaultGender } =
    useMemberForm(String(form.value.relation_type))

  const schema = z
    .object({
      first_name: z.string().min(1, { message: 'First name is required.' }),
      middle_name: z.string().optional(),
      family_name: z.string().optional(),
      is_same_family_name: z.boolean(),
      nickname: z.string().optional(),
      relation_type: z.string().min(1, { message: 'Relation type is required.' }),
      profile_picture: z.instanceof(File).optional(),
      gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
      related_through: z.number().optional(),
      parent_id: z.number().optional(),
      is_adoptive: z.boolean(),
      is_former: z.boolean(),
      is_deceased: z.boolean(),
      date_of_birth: z.string().optional(),
    })
    .refine(
      (data) => {
        // If is_same_family_name is false, family_name is required
        if (!data.is_same_family_name) {
          return data.family_name && data.family_name.trim().length > 0
        }
        return true
      },
      {
        message: 'Family name is required when not using the same family name.',
        path: ['family_name'],
      },
    )
    .refine(
      (data) => {
        // If relation_type requires related_through, it must be provided
        if (
          data.relation_type &&
          relationshipsRequiringRelatedThrough.value.includes(
            data.relation_type as (typeof relationshipsRequiringRelatedThrough.value)[number],
          )
        ) {
          return data.related_through !== null && data.related_through !== undefined
        }
        return true
      },
      {
        message: 'Related through is required for this relationship type.',
        path: ['related_through'],
      },
    )
    .refine(
      (data) => {
        // If relation_type requires parent_id, it must be provided
        if (
          data.relation_type &&
          relationshipsRequiringParentId.value.includes(data.relation_type as string)
        ) {
          return data.parent_id !== null && data.parent_id !== undefined
        }
        return true
      },
      {
        message: 'Parent id is required for this relationship type.',
        path: ['parent_id'],
      },
    )
  const rules = {
    first_name: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ first_name: true }).parse({ first_name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'First name is required.'
          return Promise.reject(messageText)
        }
      },
    },
    middle_name: {
      required: false,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ middle_name: true }).parse({ middle_name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Relation type is required.'
          return Promise.reject(messageText)
        }
      },
    },
    family_name: {
      required: false,
      trigger: ['input', 'change'],
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          // Get the current form values to check is_same_family_name
          const isSameFamilyName = form.value.is_same_family_name

          // If is_same_family_name is false, family_name is required
          if (!isSameFamilyName) {
            if (!value || value.trim().length === 0) {
              return Promise.reject('Family name is required when not using the same family name.')
            }
          }

          schema.pick({ family_name: true }).parse({ family_name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid family name.'
          return Promise.reject(messageText)
        }
      },
    },
    is_same_family_name: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: boolean) => {
        try {
          schema.pick({ is_same_family_name: true }).parse({ is_same_family_name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError
              ? err.issues?.[0]?.message
              : 'Invalid value for is same family name.'
          return Promise.reject(messageText)
        }
      },
    },
    nickname: {
      required: false,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ nickname: true }).parse({ nickname: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Family name is required.'
          return Promise.reject(messageText)
        }
      },
    },
    relation_type: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ relation_type: true }).parse({ relation_type: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Relation type is required.'
          return Promise.reject(messageText)
        }
      },
    },
    related_through: {
      required: !!(
        form.value.relation_type &&
        relationshipsRequiringRelatedThrough.value.includes(form.value.relation_type as string)
      ),
      trigger: ['input', 'change'],
      validator: async (_rule: FormItemRule, value: number | null) => {
        try {
          const relationType = form.value.relation_type

          // Check if this relation type requires related_through
          if (
            relationType &&
            relationshipsRequiringRelatedThrough.value.includes(relationType as string)
          ) {
            if (value === null || value === undefined) {
              return Promise.reject('Related through is required for this relationship type.')
            }
          }

          schema.pick({ related_through: true }).parse({ related_through: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid related through value.'
          return Promise.reject(messageText)
        }
      },
    },
    parent_id: {
      required: !!(
        form.value.relation_type &&
        relationshipsRequiringParentId.value.includes(form.value.relation_type as string)
      ),
      trigger: ['input', 'change'],
      validator: async (_rule: FormItemRule, value: number | null) => {
        try {
          const relationType = form.value.relation_type

          // Check if this relation type requires parent_id
          if (
            relationType &&
            relationshipsRequiringParentId.value.includes(relationType as string)
          ) {
            if (value === null || value === undefined) {
              return Promise.reject('Parent id is required for this relationship type.')
            }
          }

          schema.pick({ parent_id: true }).parse({ parent_id: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid parent id value.'
          return Promise.reject(messageText)
        }
      },
    },
    profile_picture: {
      required: false,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: File | null) => {
        try {
          schema.pick({ profile_picture: true }).parse({ profile_picture: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Profile picture is required.'
          return Promise.reject(messageText)
        }
      },
    },
  }
  return {
    form,
    rules,
  }
}

export const familyRequestValidation = () => {
  const form = ref<FamilyRequestFormValues>({
    unique_tree_id: '',
    relative_member_id: null,
    relation_type: null,
  })

  const schema = z.object({
    unique_tree_id: z.string().min(1, { message: 'Unique tree id is required.' }),
    relative_member_id: z.number().min(1, { message: 'Relative member id is required.' }),
    relation_type: z.string().min(1, { message: 'Relation type is required.' }),
  })

  const rules = {
    unique_tree_id: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ unique_tree_id: true }).parse({ unique_tree_id: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Unique tree id is required.'
          return Promise.reject(messageText)
        }
      },
    },
    relative_member_id: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: number) => {
        try {
          schema.pick({ relative_member_id: true }).parse({ relative_member_id: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Relative member id is required.'
          return Promise.reject(messageText)
        }
      },
    },
    relation_type: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ relation_type: true }).parse({ relation_type: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Relation type is required.'
          return Promise.reject(messageText)
        }
      },
    },
  }
  return {
    form,
    rules,
  }
}
