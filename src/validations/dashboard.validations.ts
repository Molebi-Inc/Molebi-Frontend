import type { AnnouncementFormValues } from '@/types/announcement.types'
import type {
  FamilyTraditionFormValues,
  FamilyMediaFormValues,
} from '@/types/family-tradition.types'
import type { StorageFormValues } from '@/types/storage.types'

import { ref } from 'vue'
import type { FormItemRule } from 'naive-ui'
import { z } from 'zod'
import type { FamilyMemberInterface } from '@/types/family-tree.types'

export const announcementValidation = () => {
  const form = ref<AnnouncementFormValues>({
    title: '',
    content: '',
    priority: 'high',
    type: null,
    member_ids: [],
    create_reminder: true,
  })

  const schema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    priority: z.enum(['high', 'medium', 'low'], {
      message: 'Priority must be high, medium, or low.',
    }),
    member_ids: z.array(z.any()).min(0),
    create_reminder: z.boolean(),
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
    priority: {
      required: true,
      trigger: 'change',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ priority: true }).parse({ priority: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Priority is required.'
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

export const familyTraditionValidation = () => {
  const form = ref<FamilyTraditionFormValues>({
    title: '',
    description: '',
    recurrence: null,
    date: new Date().toISOString().split('T')[0],
    time: null,
    date_mode: null,
    family_member_ids: [],
  })

  const schema = z.object({
    title: z.string().min(1, { message: 'Name is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    date: z.string().min(1, { message: 'Date is required.' }),
    time: z.string().min(1, { message: 'Time is required.' }),
    recurrence: z.string().min(1, { message: 'Reoccurrence is required.' }),
    family_member_ids: z.array(z.number()).min(0),
  })

  const rules = {
    name: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ title: true }).parse({ title: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Name is required.'
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
    recurrence: {
      required: true,
      trigger: 'change',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ recurrence: true }).parse({ recurrence: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Reoccurrence is required.'
          return Promise.reject(messageText)
        }
      },
    },
    date: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ date: true }).parse({ date: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Date is required.'
          return Promise.reject(messageText)
        }
      },
    },
    time: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ time: true }).parse({ time: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Time is required.'
          return Promise.reject(messageText)
        }
      },
    },
    family_member_ids: {
      required: true,
      trigger: 'change',
      validator: async (_rule: FormItemRule, value: FamilyMemberInterface['id'][]) => {
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
  }

  return {
    form,
    rules,
  }
}

export const familyMediaValidation = () => {
  const form = ref<FamilyMediaFormValues>({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    media: [],
  })

  const schema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    event_date: z.string().optional(),
    media: z.array(z.any()).min(0),
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
    event_date: {
      required: false,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ event_date: true }).parse({ event_date: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Media type is required.'
          return Promise.reject(messageText)
        }
      },
    },
    media: {
      required: true,
      trigger: 'change',
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

export const storageValidation = () => {
  const form = ref<StorageFormValues>({
    name: '',
    description: '',
    files: [],
  })

  const schema = z.object({
    name: z.string().min(1, { message: 'Name is required.' }),
    description: z.string().optional(),
    files: z.array(z.instanceof(File)).min(1, { message: 'At least one file is required.' }),
  })

  const rules = {
    name: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ name: true }).parse({ name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Name is required.'
          return Promise.reject(messageText)
        }
      },
    },
    files: {
      required: true,
      trigger: 'change',
      validator: async (_rule: FormItemRule, value: File[]) => {
        try {
          schema.pick({ files: true }).parse({ files: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'At least one file is required.'
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
