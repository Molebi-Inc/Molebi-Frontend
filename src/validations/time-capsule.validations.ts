import { z } from 'zod'
import { ref } from 'vue'
import type { TimeCapsuleFormValues } from '@/types/time-capsule.types'
import type { FormItemRule } from 'naive-ui'

export const timeCapsuleValidation = () => {
  const form = ref<TimeCapsuleFormValues>({
    title: '',
    description: '',
    body: '',
    open_date: new Date().toISOString().split('T')[0],
    family_members: [],
    media: [],
  })
  const schema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    body: z.string().min(1, { message: 'Body is required.' }),
    open_date: z.string().min(1, { message: 'Open date is required.' }),
    family_members: z.array(z.number()).min(1, { message: 'Family members are required.' }),
    media: z.array(z.instanceof(File)).min(1, { message: 'Media is required.' }),
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
    body: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ body: true }).parse({ body: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Body is required.'
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
    family_members: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: number[] | string[]) => {
        try {
          schema.pick({ family_members: true }).parse({ family_members: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Family members are required.'
          return Promise.reject(messageText)
        }
      },
    },
    media: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: File[]) => {
        try {
          schema.pick({ media: true }).parse({ media: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Media is required.'
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
