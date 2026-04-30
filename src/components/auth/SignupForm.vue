<template>
  <div :class="[isCompactConstrainedMobile ? 'h-full min-h-0 flex flex-col' : '']">
    <n-form ref="formRef" :label-width="80" :model="form" :rules="rules">
      <div :class="[
        'flex flex-col gap-3',
        isCompactConstrainedMobile ? 'mb-4' : 'mb-11',
        { 'grid grid-cols-2 gap-4': constrained && isLargeScreen },
      ]">
        <n-form-item label="First Name" path="first_name" :show-feedback="!!fieldErrors['first_name']">
          <MlbInput v-model="form.first_name" id="first_name" name="first_name" type="text"
            placeholder="Enter First Name" :custom-class="inputCustomClass" />
        </n-form-item>
        <n-form-item label="Last Name" path="family_name" :show-feedback="!!fieldErrors['family_name']">
          <MlbInput v-model="form.family_name" id="family_name" name="family_name" type="text"
            placeholder="Enter Last Name" :custom-class="inputCustomClass" />
        </n-form-item>
        <n-form-item v-if="version !== 'v2'" label="Phone Number" path="phone"
          :show-feedback="!!fieldErrors['phone'] || !!fieldErrors['code']">
          <n-input-group class="w-full">
            <n-select v-model:value="form.code" size="large" :style="{ width: '30%' }" placeholder="+234" filterable
              :consistent-menu-width="false" :options="countryOptions" :render-label="renderCountryLabel"
              @filter="filterCountryOptions" />
            <n-input v-model:value="form.phone" class="mlb-input" :style="{ width: '70%' }"
              placeholder="Enter phone number" />
          </n-input-group>
        </n-form-item>
        <n-form-item v-if="version === 'v2'" label="Gender" path="gender"
          label-style="color: #807F94; font-weight: 500;" required
          :show-feedback="!!fieldErrors['gender'] || !!fieldErrors['gender']">
          <NSelect v-model:value="form.gender" class="select-menu" :options="genderOptions" placeholder="Select Gender"
            size="large" :class="['w-full mlb-select h-[46px]', isV2 && isMobile ? 'bg-brand-green' : '']">
            <template #arrow>
              <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
            </template>
          </NSelect>
        </n-form-item>
        <n-form-item label="Email" path="email" :show-feedback="!!fieldErrors['email']">
          <MlbInput v-model="form.email" id="email" name="email" type="text" placeholder="Enter Email"
            :custom-class="inputCustomClass" />
        </n-form-item>
        <n-form-item label="Password" path="password" :show-feedback="!!fieldErrors['password']">
          <MlbInput v-model="form.password" id="password" name="password" type="password" show-password-on="mousedown"
            placeholder="Enter your password" :custom-class="inputCustomClass" />
        </n-form-item>
        <n-form-item label="Confirm Password" path="password_confirmation"
          :show-feedback="!!fieldErrors['password_confirmation']">
          <MlbInput v-model="form.password_confirmation" id="password_confirmation" name="password_confirmation"
            type="password" show-password-on="mousedown" placeholder="Confirm password"
            :custom-class="inputCustomClass" />
        </n-form-item>
        <div v-if="form.password" :class="[isCompactConstrainedMobile ? 'mb-1' : 'mb-3']">
          <div v-for="item in isPasswordValid" :key="item.label" class="flex items-center">
            <MlbIcon :name="item.icon" :size="12" :color="item.condition(form.password) ? 'green' : 'red'" />
            <span :class="[
              'ml-1 text-xs',
              item.condition(form.password) ? 'text-green-500' : 'text-red-500',
            ]">{{ item.label }}</span>
          </div>
        </div>
      </div>
      <MlbButton type="submit" :label="loading ? 'Signing up...' : 'Continue'" :loading="loading" :disabled="loading"
        block class="rounded-2xl! bg-primary! h-13! text-white!" @click="onFormSubmit" />
    </n-form>
    <div :class="[isCompactConstrainedMobile ? 'mt-3' : 'mt-5']">
      <div class="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
        <div class="shrink-0 mt-[2px]">
          <MlbIcon name="vuesax.outline.shield-tick" :size="22" color="#036603" />
        </div>
        <p class="text-green-900 text-sm leading-5">
          <span class="font-semibold">Your information is private</span>
          and only visible to family members you invite.
        </p>
      </div>
    </div>
    <div :class="[
      'text-center mt-3',
      isCompactConstrainedMobile ? 'mb-3' : 'mb-6 md:mb-12',
    ]">
      <p class="text-neutral-600 font-normal fs-14 lh-18">
        Already have an account?
        <MlbButton text label="Login" class="text-grey-900! underline!"
          @click="$router.push({ name: 'Guests.SigninView' })" />
      </p>
    </div>
    <div>
      <div :class="['relative flex items-center', isCompactConstrainedMobile ? 'py-3' : 'py-5']">
        <div class="grow border-t border-gray-400"></div>
        <span :class="['shrink text-gray-400', isCompactConstrainedMobile ? 'mx-2 text-xs' : 'mx-4']">or continue with</span>
        <div class="grow border-t border-gray-400"></div>
      </div>
      <div class="flex gap-2 justify-center">
        <MlbButton v-for="option in socialSignInOptions" :key="option.label" @click="handleSocialAuth(option.tag)">
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
import { useMediaQuery } from '@vueuse/core'
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
import { useMemberForm } from '@/composables/member-form.composables'

const props = defineProps<{
  invitationParams?: InvitationParamsInterface | null
  constrained?: boolean
  version?: 'v1' | 'v2'
}>()

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const authConfig = useAuthConfig()
const { form, rules, fieldErrors } = signupValidation()
const signupMutation = useSignupMutation()
const authenticationStore = useAuthenticationStore()
const { handleSocialAuthenticationRedirect } = useSocialSignin()

const { genderOptions } = useMemberForm('self')

const formRef = ref<FormInst | null>(null)
const socialAuthLoader = ref<boolean>(false)
const isMobile = useMediaQuery('(max-width: 767px)')
const isCompactHeight = useMediaQuery('(max-height: 760px)')

const isV2 = computed(() => props.version === 'v2')
const isCompactConstrainedMobile = computed(
  () => Boolean(props.constrained) && isMobile.value && isCompactHeight.value,
)
const inputCustomClass = computed(() => {
  const base = 'border-gray-300 focus:border-primary-500'
  return isV2.value && isMobile.value ? `${base} bg-brand-green` : base
})

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

:deep(.mlb-select.bg-brand-green) .n-base-selection,
:deep(.mlb-select.bg-brand-green) .n-base-selection-label,
:deep(.mlb-select.bg-brand-green) .n-base-selection-input {
  background-image: linear-gradient(180deg, #f1fbf4 41.55%, #fafafa 138.77%) !important;
  background-color: transparent !important;
}

:deep(.mlb-select.bg-brand-green) .n-base-selection-label,
:deep(.mlb-select.bg-brand-green) .n-base-selection-input {
  border-radius: 0.5rem !important;
}
</style>
