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
              :filter="filterCountryOptions"
              :consistent-menu-width="false"
              :options="countryOptions"
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
        <MlbButton v-for="option in socialSignInOptions" :key="option.label">
          <template #icon>
            <MlbIcon :name="option.icon" />
          </template>
        </MlbButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { signupValidation } from '@/validations/authentication.validations'
import type { FormInst, SelectOption } from 'naive-ui'
import { NForm, NFormItem, NInput, NSelect, NInputGroup, useMessage } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useSignupMutation } from '@/services/authentication.services'
import { handleApiError } from '@/helpers/error.helpers'
import { useAuthConfig } from '@/config/auth.config'
import country from 'country-list-js'
import type { Country } from '@/types/general.types'
import { useAuthenticationStore } from '@/stores/authentication.store'

const $router = useRouter()
const message = useMessage()
const { form, rules } = signupValidation()
const signupMutation = useSignupMutation()
const authConfig = useAuthConfig()
const authenticationStore = useAuthenticationStore()

const formRef = ref<FormInst | null>(null)
const loading = computed(() => signupMutation.isPending.value)

const countryOptions = Object.values(country.all as Record<string, Country>).map((country) => ({
  label: `${country.name} (${country.dialing_code.indexOf('+') === 0 ? country.dialing_code : `+${country.dialing_code}`})`,
  value:
    country.dialing_code.indexOf('+') === 0 ? country.dialing_code : `+${country.dialing_code}`,
}))

const filterCountryOptions = (pattern: string, option: SelectOption): boolean => {
  if (!pattern) return true
  const searchPattern = pattern.toLowerCase().trim()
  const label = String(option.label || '').toLowerCase()
  const value = String(option.value || '').toLowerCase()

  // Check if pattern matches country name, dialing code, or full label exactly
  return label.includes(searchPattern) || value.includes(searchPattern)
}

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      const response = await signupMutation.mutateAsync({
        ...form.value,
        phone: `${form.value.code}${form.value.phone}`,
      })
      authenticationStore.setStoreProp('signupForm', {
        ...form.value,
        email: form.value.email,
      })
      authConfig.setToken(response.data.token, true)
      authConfig.setOtpExpirationInMinutes(response.data.expires_in_minutes)
      authConfig.setOtpRequestTime(new Date().toISOString())

      $router.push({ name: 'Guests.OnboardingView', params: { module: 'verify-email' } })
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

const socialSignInOptions = computed(() => [
  {
    label: 'Google',
    icon: 'google',
  },
  {
    label: 'Facebook',
    icon: 'facebook',
  },
  {
    label: 'Apple',
    icon: 'apple',
  },
])
</script>

<style scoped>
:deep(.n-base-selection) {
  height: 100% !important;
}
</style>
