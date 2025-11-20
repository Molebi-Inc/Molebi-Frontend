import { ref } from 'vue'
import type { ProfileFormValues } from '@/types/profile.types'
import { z } from 'zod'
import type { FormItemRule } from 'naive-ui'

export const profileValidation = () => {
  const form = ref<ProfileFormValues>({
    first_name: '',
    family_name: '',
    email: '',
    code: '',
    phone: '',
    avatar: undefined,
  })

  const schema = z.object({
    first_name: z.string().min(1, { message: 'First name is required' }),
    family_name: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    code: z.string().min(1, { message: 'Country code is required' }),
    phone: z.string().min(1, { message: 'Phone is required' }),
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
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'First name is required'
          return Promise.reject(messageText)
        }
      },
    },
    family_name: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ family_name: true }).parse({ family_name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Last name is required'
          return Promise.reject(messageText)
        }
      },
    },
    email: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ email: true }).parse({ email: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid email address'
          return Promise.reject(messageText)
        }
      },
    },
    code: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ code: true }).parse({ code: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid country code'
          return Promise.reject(messageText)
        }
      },
    },
    phone: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ phone: true }).parse({ phone: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Phone is required'
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

export const changePinValidation = () => {
  const form = ref<{
    old_pin: string
    pin: string
    pin_confirmation: string
  }>({
    old_pin: '',
    pin: '',
    pin_confirmation: '',
  })

  const changePinSchema = z
    .object({
      old_pin: z.string().min(1, { message: 'Old PIN is required.' }),
      pin: z
        .string()
        .min(4, { message: 'PIN must be at least 4 digits.' })
        .max(6, { message: 'PIN must be at most 6 digits.' }),
      pin_confirmation: z
        .string()
        .min(1, { message: 'PIN confirmation is required.' })
        .refine((val) => val === form.value.pin, {
          message: 'PINs do not match.',
          path: ['pin_confirmation'],
        }),
    })
    .refine(
      (data) => {
        return data.old_pin !== data.pin
      },
      {
        message: 'New PIN must be different from old PIN.',
        path: ['pin'],
      },
    )

  const rules: Record<string, any> = {
    old_pin: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          changePinSchema.pick({ old_pin: true }).parse({ old_pin: value })
          if (form.value.pin) {
            changePinSchema.parse({
              old_pin: value,
              pin: form.value.pin,
              pin_confirmation: form.value.pin_confirmation,
            })
          }
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid old PIN.'
          return Promise.reject(messageText)
        }
      },
    },
    pin: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          changePinSchema.pick({ pin: true }).parse({ pin: value })
          if (form.value.old_pin) {
            changePinSchema.parse({
              old_pin: form.value.old_pin,
              pin: value,
              pin_confirmation: form.value.pin_confirmation,
            })
          }
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText = err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid PIN.'
          return Promise.reject(messageText)
        }
      },
    },
    pin_confirmation: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          changePinSchema.pick({ pin_confirmation: true }).parse({ pin_confirmation: value })
          if (form.value.old_pin) {
            changePinSchema.parse({
              old_pin: form.value.old_pin,
              pin: form.value.pin,
              pin_confirmation: value,
            })
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
