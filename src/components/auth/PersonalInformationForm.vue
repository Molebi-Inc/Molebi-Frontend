<template>
  <div>
    <n-form ref="formRef" :label-width="80" :model="form" :rules="rules">
      <div class="flex flex-col gap-1 mb-11">
        <n-form-item label="First Name" path="first_name">
          <MlbInput
            v-model="form.first_name"
            id="first_name"
            name="first_name"
            type="text"
            placeholder="Enter First Name"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Middle Name" path="middle_name">
          <MlbInput
            v-model="form.middle_name"
            id="middle_name"
            name="middle_name"
            type="text"
            placeholder="Enter Middle Name"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Nickname" path="nickname">
          <MlbInput
            v-model="form.nickname"
            id="nickname"
            name="nickname"
            type="text"
            placeholder="Enter Nickname"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Family Name" path="family_name">
          <MlbInput
            v-model="form.family_name"
            id="family_name"
            name="family_name"
            type="text"
            placeholder="Enter Family Name"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Date of Birth" path="dob">
          <n-date-picker
            v-model:formatted-value="form.dob"
            id="dob"
            name="dob"
            type="date"
            placeholder="Enter Date of Birth"
            class="w-full"
          />
        </n-form-item>
      </div>
      <div class="flex items-start gap-2 bg-primary-50 p-3 rounded-xl text-primary-900 mb-11">
        <div>
          <MlbIcon name="material.info.outline.rounded" :size="14" />
        </div>
        <div class="text-[10px]">
          All details you provide are private and protected. No one else can access them without
          your permission and your date of birth would not be visible to anyone but you.
        </div>
      </div>
      <MlbButton
        type="submit"
        :label="loading ? 'Continuing...' : 'Continue'"
        :loading="loading"
        :disabled="loading"
        block
        class="rounded-2xl! bg-primary-700! h-13! text-white!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInst } from 'naive-ui'
import { NForm, NFormItem, NDatePicker, useMessage } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import { useRouter } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import { useUpdateProfileMutation } from '@/services/authentication.services'
import { useAuthenticationStore } from '@/stores/authentication.store'
import { personalInformationValidation } from '@/validations/authentication.validations'

const $router = useRouter()
const message = useMessage()
const { form, rules } = personalInformationValidation()
const authenticationStore = useAuthenticationStore()
const updateProfileMutation = useUpdateProfileMutation()

const formRef = ref<FormInst | null>(null)
const loading = computed(() => updateProfileMutation.isPending.value)

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    authenticationStore.setStoreProp('signupForm', form.value)
    try {
      const response = await updateProfileMutation.mutateAsync(form.value)

      message.success(response.message || 'Profile updated successfully')

      $router.push({ name: 'Guests.OnboardingView', params: { module: 'seed-phase' } })
    } catch (error) {
      handleApiError(error, message)
    }
  })
}
</script>
