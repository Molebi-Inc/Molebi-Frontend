<template>
  <div class="md:px-[72px] md:py-[40px] bg-white">
    <div class="grid grid-cols-7 gap-4">
      <div class="col-span-full md:col-span-3">
        <header class="h-[244px] flex items-center justify-center bg-secondary-50 md:hidden mb-10">
          <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
        </header>
        <header class="md:block hidden mb-15">
          <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
        </header>
        <div class="px-6 md:px-[72px] md:py-[40px]">
          <div class="mb-11">
            <h1 class="text-neutral-900 font-semibold text-2xl mb-2 text-left md:text-center">
              Welcome Back!
            </h1>
            <p class="text-neutral-600 font-normal text-sm text-left md:text-center">
              Enter your details to continue.
            </p>
          </div>
          <div>
            <n-form ref="formRef" :label-width="80" :model="form" :rules="rules">
              <div class="flex flex-col gap-1">
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
              </div>
              <div class="mb-11 flex justify-end items-center gap-1">
                Forgot Password?
                <MlbButton
                  text
                  label="Click Here"
                  class="text-secondary-400! underline!"
                  @click="
                    !isLargeScreen
                      ? (active = true)
                      : $router.push({
                          name: 'Guests.ForgotPasswordView',
                          params: { module: 'email' },
                        })
                  "
                />
              </div>
              <MlbButton
                block
                type="submit"
                label="Login"
                :loading="loading"
                :disabled="loading"
                class="rounded-2xl! bg-primary-700! h-13! text-white!"
                @click="onFormSubmit"
              />
              <div class="text-center mt-3 mb-12">
                <p class="text-neutral-600 font-normal fs-14 lh-18">
                  Don’t have an account?
                  <MlbButton
                    text
                    label="Click Here"
                    class="text-secondary-400! underline!"
                    @click="
                      $router.push({
                        name: 'Guests.OnboardingSignup',
                        params: { module: 'signup' },
                      })
                    "
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
            </n-form>
          </div>
        </div>
      </div>
      <div></div>
      <div class="hidden md:block md:col-span-3">
        <img src="@/assets/images/family-login.png" alt="Family Login" class="w-[540px] h-full" />
      </div>
    </div>
    <n-drawer v-model:show="active" placement="bottom" :height="306" class="rounded-t-3xl!">
      <n-drawer-content>
        <BackButton
          class="mb-2"
          route-name="Guests.SigninView"
          label="Cancel"
          @update:go-back="active = false"
        />
        <div class="mb-3">
          <h1 class="text-neutral-900 font-semibold text-2xl mb-1 text-center">Reset Password</h1>
          <p class="text-neutral-600 font-normal text-sm line-height-18 text-center">
            Enter your registered  email address and we’ll send you password reset instructions.
          </p>
        </div>
        <ResetPasswordEmailForm @back="active = false" />
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
<script setup lang="ts">
import { signinValidation } from '@/validations/authentication.validations'
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import BackButton from '@/components/common/BackButton.vue'
import ResetPasswordEmailForm from '@/components/auth/ResetPasswordEmailForm.vue'
import { useMessage, NForm, NFormItem, NDrawer, NDrawerContent } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { ref, computed } from 'vue'
import { useSigninMutation } from '@/services/authentication.services'
import { useAuthConfig } from '@/config/auth.config'
import { handleApiError } from '@/helpers/error.helpers'

const $router = useRouter()
const message = useMessage()
const authConfig = useAuthConfig()
const signinMutation = useSigninMutation()
const { form, rules } = signinValidation()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

const active = ref<boolean>(false)
const formRef = ref<FormInst | null>(null)

const loading = computed(() => signinMutation.isPending.value)

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      const response = await signinMutation.mutateAsync(form.value)
      authConfig.setToken(response.data.token)
    } catch (error) {
      handleApiError(error, message)
    }
    $router.push({ name: 'App.HomeView' })
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
