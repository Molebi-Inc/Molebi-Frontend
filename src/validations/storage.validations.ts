import { ref } from 'vue'
import type { ShareFolderFormValues } from '@/types/storage.types'
import { z } from 'zod'
import type { FormItemRule } from 'naive-ui'

export const shareFolderFormValidation = () => {
  const form = ref<ShareFolderFormValues>({
    family_member_id: [],
    permission: 'edit',
  })

  const schema = z.object({
    family_member_id: z.array(z.number()).min(1, { message: 'Family members are required' }),
    permission: z.enum(['view', 'edit', 'manage']),
  })

  const rules = {
    family_member_id: [
      {
        required: true,
        trigger: 'input',
        validator: async (_rule: FormItemRule, value: number[]) => {
          try {
            schema.pick({ family_member_id: true }).parse({ family_member_id: value })
            return Promise.resolve()
          } catch (err: unknown) {
            const messageText =
              err instanceof z.ZodError ? err.issues?.[0]?.message : 'Family members are required'
            return Promise.reject(messageText)
          }
        },
      },
    ],
    permission: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: 'view' | 'edit' | 'manage') => {
        try {
          schema.pick({ permission: true }).parse({ permission: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Permission is required'
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
