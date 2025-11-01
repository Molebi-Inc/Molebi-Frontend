import type {
  PersonalInformationFormValues,
  SignupFormValues,
  FamilyMemberFormValues,
  FamilyInfoFormValues,
  SigninFormValues,
} from '@/types/authentication.types'
import { computed, ref } from 'vue'
import type { FormItemRule } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { z } from 'zod'

export const signupValidation = () => {
  const form = ref<SignupFormValues>({
    email: '',
    phone: '',
    code: '',
    password: '',
    password_confirmation: '',
  })

  const signupSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    phone: z.string().min(1, { message: 'Phone number is required.' }),
    code: z.string().min(1, { message: 'Country code is required.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
    password_confirmation: z
      .string()
      .min(1, { message: 'Password confirmation is required.' })
      .refine((val: string) => val === form.value.password, {
        message: 'Passwords do not match.',
        path: ['password_confirmation'],
      }),
  })

  const rules = {
    email: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          signupSchema.pick({ email: true }).parse({ email: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid email address.'
          return Promise.reject(messageText)
        }
      },
    },
    phone: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          signupSchema.pick({ phone: true }).parse({ phone: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid phone number.'
          return Promise.reject(messageText)
        }
      },
    },
    code: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          signupSchema.pick({ code: true }).parse({ code: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid country code.'
          return Promise.reject(messageText)
        }
      },
    },
    password: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          signupSchema.pick({ password: true }).parse({ password: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid password.'
          return Promise.reject(messageText)
        }
      },
    },
    password_confirmation: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          signupSchema.pick({ password_confirmation: true }).parse({ password_confirmation: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid password confirmation.'
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

export const personalInformationValidation = () => {
  const form = ref<PersonalInformationFormValues>({
    first_name: '',
    middle_name: '',
    family_name: '',
  })

  const schema = z.object({
    first_name: z.string().min(1, { message: 'First name is required.' }),
    middle_name: z.string().min(1, { message: 'Middle name is required.' }),
    family_name: z.string().min(1, { message: 'Family name is required.' }),
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
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ middle_name: true }).parse({ middle_name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Middle name is required.'
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
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Family name is required.'
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

export const familyInfoValidation = () => {
  const form = ref<FamilyInfoFormValues>({
    state_of_origin: '',
    family_name: '',
  })

  const schema = z.object({
    state_of_origin: z.string().min(1, { message: 'State of origin is required.' }),
    family_name: z.string().min(1, { message: 'Family name is required.' }),
  })

  const rules = {
    state_of_origin: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ state_of_origin: true }).parse({ state_of_origin: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'State of origin is required.'
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
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Family name is required.'
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

export const familyMemberValidation = () => {
  const form = ref<FamilyMemberFormValues>({
    relationship: '',
    first_name: '',
    last_name: '',
  })

  const schema = z.object({
    relationship: z.string().min(1, { message: 'Relationship is required.' }),
    first_name: z.string().min(1, { message: 'First name is required.' }),
    last_name: z.string().min(1, { message: 'Last name is required.' }),
  })

  const rules = {
    relationship: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ relationship: true }).parse({ relationship: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Relationship is required.'
          return Promise.reject(messageText)
        }
      },
    },
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
    last_name: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          schema.pick({ last_name: true }).parse({ last_name: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Last name is required.'
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

export const signinValidation = () => {
  const form = ref<SigninFormValues>({
    email: '',
    password: '',
  })

  // Define Zod schema for signin
  const signinSchema = z.object({
    email: z
      .string()
      .min(1, { message: 'Email is required.' })
      .email({ message: 'Invalid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
  })

  // Rules using Zod (for integration with Naive UI n-form)
  const rules = {
    email: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          signinSchema.pick({ email: true }).parse({ email: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid email address.'
          return Promise.reject(messageText)
        }
      },
    },
    password: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          signinSchema.pick({ password: true }).parse({ password: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Password is required.'
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

export const resetPasswordValidation = () => {
  const form = ref<{ email: string }>({
    email: '',
  })

  // Define Zod schema for signin
  const signinSchema = z.object({
    email: z
      .string()
      .min(1, { message: 'Email is required.' })
      .email({ message: 'Invalid email address.' }),
  })

  // Rules using Zod (for integration with Naive UI n-form)
  const rules = {
    email: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          signinSchema.pick({ email: true }).parse({ email: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid email address.'
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

export const otpValidation = () => {
  const form = ref<{ otp: string[] }>({
    otp: [],
  })

  const otpSchema = z.object({
    otp: z
      .array(z.string().min(1, { message: 'Each field is required.' }))
      .length(4, { message: 'OTP must be 4 digits.' }),
  })

  const rules = {
    otp: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string[]) => {
        try {
          otpSchema.pick({ otp: true }).parse({ otp: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText = err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid OTP.'
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

export const changePasswordValidation = () => {
  const form = ref<{ password: string; password_confirmation: string }>({
    password: '',
    password_confirmation: '',
  })

  const changePasswordSchema = z.object({
    password: z.string().min(1, { message: 'Password is required.' }),
    password_confirmation: z
      .string()
      .min(1, { message: 'Password confirmation is required.' })
      .refine((val) => val === form.value.password, {
        message: 'Passwords do not match.',
        path: ['password_confirmation'],
      }),
  })

  const rules = {
    password: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          changePasswordSchema.pick({ password: true }).parse({ password: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText = err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid OTP.'
          return Promise.reject(messageText)
        }
      },
    },
    password_confirmation: {
      required: true,
      trigger: 'input',
      validator: async (_rule: FormItemRule, value: string) => {
        try {
          changePasswordSchema
            .pick({ password_confirmation: true })
            .parse({ password_confirmation: value })
          return Promise.resolve()
        } catch (err: unknown) {
          const messageText =
            err instanceof z.ZodError ? err.issues?.[0]?.message : 'Invalid password confirmation.'
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
