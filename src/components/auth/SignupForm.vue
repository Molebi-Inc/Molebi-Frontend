<template>
  <div>
    <n-form ref="formRef" :label-width="80" :model="form" :rules="rules">
      <div class="flex flex-col gap-1 mb-11">
        <n-form-item label="Email" path="email">
          <MlbInput
            v-model="form.email"
            id="email"
            name="email"
            type="text"
            placeholder="Enter Email"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Phone Number" path="phone">
          <n-input-group class="w-full">
            <n-select
              v-model:value="form.code"
              size="large"
              :style="{ width: '30%' }"
              placeholder="+234"
              filterable
              :consistent-menu-width="false"
              :options="countryOptions"
              :render-label="renderCountryLabel"
              @filter="filterCountryOptions"
            />
            <n-input
              v-model:value="form.phone"
              class="mlb-input"
              :style="{ width: '70%' }"
              placeholder="Enter phone number"
            />
          </n-input-group>
        </n-form-item>
        <n-form-item label="Password" path="password">
          <MlbInput
            v-model="form.password"
            id="password"
            name="password"
            type="password"
            show-password-on="mousedown"
            placeholder="Enter your password"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <div v-if="form.password" class="mb-3">
          <div v-for="item in isPasswordValid" :key="item.label" class="flex items-center">
            <MlbIcon
              :name="item.icon"
              :size="12"
              :color="item.condition(form.password) ? 'green' : 'red'"
            />
            <span
              :class="[
                'ml-1 text-xs',
                item.condition(form.password) ? 'text-green-500' : 'text-red-500',
              ]"
              >{{ item.label }}</span
            >
          </div>
        </div>
        <n-form-item label="Confirm Password" path="password_confirmation">
          <MlbInput
            v-model="form.password_confirmation"
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            show-password-on="mousedown"
            placeholder="Confirm password"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
      </div>
      <MlbButton
        type="submit"
        :label="loading ? 'Signing up...' : 'Continue'"
        :loading="loading"
        :disabled="loading"
        block
        class="rounded-2xl! bg-primary-700! h-13! text-white!"
        @click="onFormSubmit"
      />
    </n-form>
    <div class="text-center mt-3 mb-12">
      <p class="text-neutral-600 font-normal fs-14 lh-18">
        Already have an account?
        <MlbButton
          text
          label="Login"
          class="text-secondary-400! underline!"
          @click="$router.push({ name: 'Guests.SigninView' })"
        />
      </p>
    </div>
    <div>
      <div class="relative flex py-5 items-center">
        <div class="grow border-t border-gray-400"></div>
        <span class="shrink mx-4 text-gray-400">or continue with</span>
        <div class="grow border-t border-gray-400"></div>
      </div>
      <div class="flex gap-2 justify-center">
        <MlbButton
          v-for="option in socialSignInOptions"
          :key="option.label"
          @click="handleSocialAuth(option.tag)"
        >
          <template #icon>
            <MlbIcon :name="option.icon" />
          </template>
        </MlbButton>
      </div>
    </div>
    <OverlayLoader v-if="socialAuthLoader" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import { useAuthConfig } from '@/config/auth.config'
import MlbButton from '@/components/ui/MlbButton.vue'
import type { FormInst, SelectOption } from 'naive-ui'
import { handleApiError } from '@/helpers/error.helpers'
import { countryOptions } from '@/constants/options.constants'
import { useAuthenticationStore } from '@/stores/authentication.store'
import {
  useSignupMutation,
  useRegisterWithInvitationMutation,
} from '@/services/authentication.services'
import { signupValidation } from '@/validations/authentication.validations'
import { NForm, NFormItem, NInput, NSelect, NInputGroup, useMessage } from 'naive-ui'
import { useSocialSignin } from '@/composables/social-signin.composable'
import type {
  SocialAuthenticationProvider,
  InvitationParamsInterface,
} from '@/types/authentication.types'
import OverlayLoader from '@/components/common/OverlayLoader.vue'

const props = defineProps<{
  invitationParams?: InvitationParamsInterface | null
}>()

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const authConfig = useAuthConfig()
const { form, rules } = signupValidation()
const signupMutation = useSignupMutation()
const authenticationStore = useAuthenticationStore()
const { handleSocialAuthenticationRedirect } = useSocialSignin()

const formRef = ref<FormInst | null>(null)
const socialAuthLoader = ref<boolean>(false)

// Determine which mutation to use based on invitation params
const invitationParams = computed<InvitationParamsInterface | null>(() => {
  if (props.invitationParams) {
    return props.invitationParams
  }
  // Also check route query params as fallback
  const expires = $route.query.expires
  const family_member_id = $route.query.family_member_id
  const signature = $route.query.signature
  if (expires && family_member_id && signature) {
    return {
      expires: Number(expires),
      family_member_id: Number(family_member_id),
      signature: String(signature),
    }
  }
  return null
})

const invitationMutation = invitationParams.value
  ? useRegisterWithInvitationMutation(invitationParams)
  : null

const loading = computed(() => {
  if (invitationMutation) {
    return invitationMutation.isPending.value
  }
  return signupMutation.isPending.value
})

export type CountrySelectOption = SelectOption & {
  countryName?: string
  fullLabel?: string
  dialingCode?: string
}

const isPasswordValid = computed(() => {
  return [
    {
      label: 'Contains at least one digit',
      icon: 'vuesax.outline.shield-tick',
      condition: (password: string) => /\d/.test(password),
    },
    {
      label: 'Contains at least one uppercase letter',
      icon: 'vuesax.outline.shield-tick',
      condition: (password: string) => /[A-Z]/.test(password),
    },
    {
      label: 'Contains at least one special character',
      icon: 'vuesax.outline.shield-tick',
      condition: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
    {
      label: 'Contains at leat 6 characters',
      icon: 'vuesax.outline.shield-tick',
      condition: (password: string) => password.length >= 6,
    },
  ]
})

const renderCountryLabel = (option: SelectOption, selected: boolean) => {
  const opt = option as CountrySelectOption
  const code =
    opt.dialingCode || String(opt.value || '').split('|')[0] || String(option.label || '')
  if (selected) {
    return code
  }
  return `${opt.flag} ${opt.fullLabel || opt.countryName || ''}`
}

const filterCountryOptions = (pattern: string, option: CountrySelectOption): boolean => {
  if (!pattern) return true
  const searchPattern = pattern.toLowerCase().trim()
  const label = String(option.label || '').toLowerCase()
  const value = String(option.dialingCode || '').toLowerCase()
  const countryName = String(option.countryName || '').toLowerCase()
  const fullLabel = String(option.fullLabel || '').toLowerCase()

  return (
    label.includes(searchPattern) ||
    value.includes(searchPattern) ||
    countryName.includes(searchPattern) ||
    fullLabel.includes(searchPattern)
  )
}

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      // form.code is `${dialingCode}|${countryCode}`; extract the dialing code part
      const dialingCode = form.value.code ? String(form.value.code).split('|')[0] : ''
      const formData = {
        ...form.value,
        phone: `${dialingCode}${form.value.phone}`,
      }

      let response

      // Use invitation mutation if invitation params are present
      if (props.invitationParams && invitationMutation) {
        response = await invitationMutation.mutateAsync(formData)
      } else {
        response = await signupMutation.mutateAsync(formData)
      }
      authenticationStore.setStoreProp('signupForm', {
        ...form.value,
        email: form.value.email,
      })
      authConfig.setToken(response.data.token, true)
      authConfig.setOtpExpirationInMinutes(response.data.expires_in_minutes)
      authConfig.setOtpRequestTime(new Date().toISOString())

      $router.push({ name: 'Guests.OnboardingView', params: { module: 'verify-email' } })
      return
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

const socialSignInOptions = computed<
  { label: string; icon: string; tag: SocialAuthenticationProvider }[]
>(() => [
  {
    label: 'Google',
    icon: 'google',
    tag: 'google',
  },
  // {
  //   label: 'Facebook',
  //   icon: 'facebook',
  //   tag: 'facebook' as SocialAuthenticationProvider,
  // },
  // {
  //   label: 'Apple',
  //   icon: 'apple',
  //   tag: 'apple' as SocialAuthenticationProvider,
  // },
])
const handleSocialAuth = async (provider: SocialAuthenticationProvider) => {
  socialAuthLoader.value = true
  try {
    await handleSocialAuthenticationRedirect(provider)
  } catch (error) {
    handleApiError(error, message)
  } finally {
    socialAuthLoader.value = false
  }
}
</script>

<style scoped>
:deep(.n-base-selection) {
  height: 100% !important;
}
</style>
