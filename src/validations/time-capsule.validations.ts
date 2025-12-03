import { z } from 'zod'
import { ref } from 'vue'
import type { TimeCapsuleFormValues } from '@/types/time-capsule.types'
import type { FormItemRule } from 'naive-ui'

export const timeCapsuleValidation = () => {
  const form = ref<TimeCapsuleFormValues>({
    // family_tree_id: 0,
    title: '',
    description: '',
    open_at: new Date().toISOString().split('T')[0],
    family_member_ids: [],
    files: [],
  })
  const schema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    open_date: z.string().min(1, { message: 'Open date is required.' }),
    family_member_ids: z.array(z.number()).min(1, { message: 'Family members are required.' }),
    files: z.array(z.instanceof(File)).min(1, { message: 'Files are required.' }),
  })

  const rules = {
    title: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ title: true }).parse({ title: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Title is required.'
          return Promise.reject(messageText)
        }
      },
    },
    description: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ description: true }).parse({ description: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Description is required.'
          return Promise.reject(messageText)
        }
      },
    },
    open_date: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ open_date: true }).parse({ open_date: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Open date is required.'
          return Promise.reject(messageText)
        }
      },
    },
    family_member_ids: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: number[] | string[]) => {
        try {
          schema.pick({ family_member_ids: true }).parse({ family_member_ids: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Family members are required.'
          return Promise.reject(messageText)
        }
      },
    },
    files: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: File[]) => {
        try {
          schema.pick({ files: true }).parse({ files: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Files are required.'
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
