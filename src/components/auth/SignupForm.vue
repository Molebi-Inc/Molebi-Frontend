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
              :style="{ width: '25%' }"
              placeholder="+234"
              :options="selectOptions"
            />
            <n-input
              v-model:value="form.phone"
              :style="{ width: '75%' }"
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
        label="Continue"
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
import type { FormInst } from 'naive-ui'
import { NForm, NFormItem, NInput, NSelect, NInputGroup, useMessage } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useAuthenticationStore } from '@/stores/authentication.store'

const $router = useRouter()
const message = useMessage()
const { form, rules } = signupValidation()
const authenticationStore = useAuthenticationStore()

const formRef = ref<FormInst | null>(null)

const selectOptions = [
  { label: '🇳🇬 +234', value: '+234' },
  { label: '🇺🇸 +1', value: '+1' },
  { label: '🇬🇧 +44', value: '+44' },
  { label: '🇦🇺 +61', value: '+61' },
  { label: '🇳🇿 +64', value: '+64' },
]

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    authenticationStore.setStoreProp('signupForm', form.value)
    $router.push({ name: 'Guests.OnboardingView', params: { module: 'verify-email' } })
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
