import { z } from 'zod'
import { ref } from 'vue'
import type { FormItemRule } from 'naive-ui'
import type { FamilyMemberFormValues, FamilyRequestFormValues } from '@/types/family-tree.types'

export const familyMemberValidation = () => {
  const form = ref<FamilyMemberFormValues>({
    first_name: '',
    middle_name: '',
    family_name: '',
    is_same_family_name: false,
    nickname: '',
    relation_type: null,
    // profile_picture: undefined,
    gender: 'male',
    related_through: null,
    parent_id: null,
    is_adoptive: false,
    is_former: false,
    is_deceased: false,
  })

  const schema = z.object({
    first_name: z.string().min(1, { message: 'First name is required.' }),
    middle_name: z.string().optional(),
    family_name: z.string().optional(),
    is_same_family_name: z.boolean(),
    nickname: z.string().optional(),
    relation_type: z.string().min(1, { message: 'Relation type is required.' }),
    profile_picture: z.instanceof(File).optional().nullable(),
  })
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
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
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
