import type { FormItemRule } from 'naive-ui'
import { ref } from 'vue'
import { z } from 'zod'
import { useArchive } from '@/composables/useArchive'
import type { CreateFolderValues } from '@/types/vault.types'

export const pinValidation = () => {
  const form = ref({
    pin: [] as string[],
  })
  const pinSchema = z.object({
    pin: z
      .array(z.string().min(1, { message: 'Each field is required.' }))
      .length(4, { message: 'PIN must be 4 digits.' }),
  })
  const rules = {
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
