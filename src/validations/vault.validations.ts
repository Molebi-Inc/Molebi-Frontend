import type { FormItemRule } from 'naive-ui'
import { ref } from 'vue'
import { z } from 'zod'
import { useArchive } from '@/composables/useArchive'
import type { CreateFolderValues } from '@/types/vault.types'

export const pinValidation = (hasConfirmation: boolean) => {
  const form = ref({
    current_pin: [] as string[],
    pin: [] as string[],
    pin_confirmation: [] as string[],
  })
  const pinSchema = z.object({
    current_pin: z
      .array(z.string().min(1, { message: 'Each field is required.' }))
      .length(4, { message: 'Current PIN must be 4 digits.' }),
    pin: z
      .array(z.string().min(1, { message: 'Each field is required.' }))
      .length(4, { message: 'PIN must be 4 digits.' }),
    pin_confirmation: hasConfirmation
      ? z
          .array(z.string().min(1, { message: 'Each field is required.' }))
          .length(4, { message: 'PIN confirmation must be 4 digits.' })
          .refine((val: string[]) => val.every((v, index) => v === form.value.pin[index]), {
            message: 'PIN confirmation does not match.',
            path: ['pin_confirmation'],
          })
      : z.array(z.string()).optional(),
  })
  const rules = {
    current_pin: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string[]) => {
        try {
          pinSchema.pick({ current_pin: true }).parse({ current_pin: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid current PIN.'
          return Promise.reject(messageText)
        }
      },
    },
    pin: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string[]) => {
        try {
          pinSchema.pick({ pin: true }).parse({ pin: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText = err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid PIN.'
          return Promise.reject(messageText)
        }
      },
    },
    pin_confirmation: {
      required: hasConfirmation,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string[]) => {
        try {
          if (hasConfirmation) {
            pinSchema.pick({ pin_confirmation: true }).parse({ pin_confirmation: value })
          }
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid PIN confirmation.'
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

export const createFolderValidation = () => {
  const { currentFlow } = useArchive()

  const form = ref<CreateFolderValues>({
    name: '',
    title: '',
  })
  const createFolderSchema = z
    .object({
      name: z.string().optional(),
      title: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (currentFlow.value === 'vault') {
        if (!data.title || data.title.trim() === '') {
          ctx.addIssue({
            code: 'custom',
            message: 'Folder title is required.',
            path: ['title'],
          })
        }
      } else {
        if (!data.name || data.name.trim() === '') {
          ctx.addIssue({
            code: 'custom',
            message: 'Folder name is required.',
            path: ['name'],
          })
        }
      }
    })
  const rules = {
    name: {
      required: currentFlow.value === 'storage',
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          createFolderSchema.pick({ name: true }).parse({ name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid folder name.'
          return Promise.reject(messageText)
        }
      },
    },
    title: {
      required: currentFlow.value === 'vault',
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          createFolderSchema.pick({ title: true }).parse({ title: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid folder title.'
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
