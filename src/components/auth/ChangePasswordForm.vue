<template>
  <div>
    <n-form
      ref="formRef"
      :label-width="80"
      :model="form"
      :rules="rules"
      class="h-full flex md:block flex-col justify-between items-center"
    >
      <div class="w-full flex flex-col gap-2">
        <n-form-item
          v-if="mode === 'change'"
          :label="mode === 'change' ? 'Old Password' : 'Password'"
          path="old_password"
        >
          <MlbInput
            v-model="form.old_password"
            id="old_password"
            name="old_password"
            type="password"
            show-password-on="mousedown"
            :placeholder="mode === 'change' ? 'Old Password' : 'Enter your password'"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item :label="mode === 'change' ? 'New Password' : 'Password'" path="password">
          <MlbInput
            v-model="form.password"
            id="password"
            name="password"
            type="password"
            show-password-on="mousedown"
            :placeholder="mode === 'change' ? 'New Password' : 'Enter your password'"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item
          :label="mode === 'change' ? 'Confirm Password' : 'Confirm Password'"
          path="password_confirmation"
        >
          <MlbInput
            v-model="form.password_confirmation"
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            show-password-on="mousedown"
            :placeholder="mode === 'change' ? 'Confirm Password' : 'Confirm your password'"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
      </div>
      <MlbButton
        type="submit"
        :label="buttonLabel"
        block
        :loading="loading"
        :disabled="loading"
        class="rounded-2xl! bg-primary-700! h-13! text-white!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
  <n-drawer
    v-if="mode === 'reset'"
    v-model:show="active"
    placement="bottom"
    :height="306"
    class="rounded-t-3xl!"
  >
    <n-drawer-content>
      <FeedbackComponent @back="active = false" />
    </n-drawer-content>
  </n-drawer>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { changePasswordValidation } from '@/validations/authentication.validations'
import { useMessage, NForm, NFormItem, NDrawer, NDrawerContent } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import FeedbackComponent from '@/components/auth/FeedbackComponent.vue'
import { useResetPasswordMutation } from '@/services/authentication.services'
import { useChangePasswordMutation } from '@/services/settings.services'
import { useAuthenticationStore } from '@/stores/authentication.store'
import { handleApiError } from '@/helpers/error.helpers'
import { AlertService } from '@/services/alert.service'
import type { PasswordMode } from '@/types/authentication.types'

interface Props {
  mode?: PasswordMode
  buttonLabel?: string
  onSuccess?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'reset',
  buttonLabel: undefined,
})

const $router = useRouter()
const message = useMessage()
const authenticationStore = useAuthenticationStore()
const { form, rules } = changePasswordValidation(props.mode)
const resetPasswordMutation = useResetPasswordMutation()
const changePasswordMutation = useChangePasswordMutation()

const formRef = ref<FormInst | null>(null)
const active = ref<boolean>(false)
const loading = ref<boolean>(false)

const buttonLabel = computed(() => {
  if (props.buttonLabel) return props.buttonLabel
  return props.mode === 'change' ? 'Save Changes' : 'Continue'
})

const onFormSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      loading.value = true

      if (props.mode === 'reset') {
        // Reset password flow (forgot password)
        const storeResetPassword = authenticationStore.resetPasswordForm

        await resetPasswordMutation.mutateAsync({
          ...storeResetPassword,
          password: form.value.password,
          password_confirmation: form.value.password_confirmation,
        })
        await AlertService.alert({
          imageUrl: 'images/success.png',
          imageAlt: 'Success',
          imageClass: 'w-24 h-24 object-contain',
          subject: 'You have successfully <br /> changed your password',
          message:
            'We know that many things may happen but we hope that you always remember your new password',
          confirmButtonText: 'Go to login',
          customClass: {
            confirmButton: 'rounded-2xl! bg-primary-700! h-13! text-white!',
          },
          buttonConfig: {
            confirm: {
              text: 'Go to login',
              action: async () => {
                $router.push({ name: 'Guests.SigninView' })
              },
              closeOnClick: true,
            },
          },
        })
      } else {
        // Change password flow (security settings)
        await changePasswordMutation.mutateAsync({
          old_password: form.value.old_password || '',
          password: form.value.password,
          password_confirmation: form.value.password_confirmation,
        })
        message.success('Password changed successfully')
        // Reset form
        form.value.old_password = ''
        form.value.password = ''
        form.value.password_confirmation = ''
        // Call success callback if provided
        if (props.onSuccess) {
          props.onSuccess()
        }
      }
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = false
    }
  })
}
</script>
