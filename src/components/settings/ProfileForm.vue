<template>
  <div>
    <n-form ref="formRef" :model="form" :rules="rules">
      <div class="grid md:grid-cols-2 md:gap-4">
        <n-form-item label="First Name" path="first_name">
          <MlbInput
            v-model="form.first_name"
            id="first_name"
            placeholder="Enter First Name"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
        <n-form-item label="Family Name / Surname" path="family_name">
          <MlbInput
            v-model="form.family_name"
            id="family_name"
            placeholder="Enter Family Name"
            custom-class="border-gray-300 focus:border-primary-500"
          />
        </n-form-item>
      </div>
      <n-form-item label="Email Address" path="email">
        <MlbInput
          v-model="form.email"
          id="email"
          type="text"
          placeholder="Enter Email Address"
          custom-class="border-gray-300 focus:border-primary-500"
        />
      </n-form-item>
      <n-form-item label="Phone" path="phone">
        <n-input-group class="w-full">
          <n-select
            v-model:value="form.code"
            size="large"
            filterable
            placeholder="+234"
            :options="countryOptions"
            :style="{ width: '30%' }"
            :consistent-menu-width="false"
          />
          <n-input
            v-model:value="form.phone"
            class="mlb-input"
            :style="{ width: '70%' }"
            placeholder="Enter phone number"
          />
        </n-input-group>
      </n-form-item>
      <MlbButton
        type="submit"
        label="Update profile"
        :primary="true"
        class="w-full rounded-2xl! h-13!"
        :loading="loading"
        :disabled="loading"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { ref, computed, onMounted } from 'vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import { useProfileStore } from '@/stores/profile.store'
import { countryOptions } from '@/constants/options.constants'
import type { ProfileFormValues } from '@/types/profile.types'
import { extractCountryCode } from '@/helpers/general.helpers'
import { profileValidation } from '@/validations/settings.validations'
import { useUpdateProfileMutation } from '@/services/authentication.services'
import { useMessage, NForm, NFormItem, NInput, NSelect, NInputGroup } from 'naive-ui'

const message = useMessage()
const profileStore = useProfileStore()
const formRef = ref<FormInst | null>(null)
const { form, rules } = profileValidation()
const updateProfileMutation = useUpdateProfileMutation()

const loading = computed(() => updateProfileMutation.isPending.value)

const onFormSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      const payload: ProfileFormValues = {
        ...form.value,
        phone: `${form.value.code}${form.value.phone}`,
      }
      const response = await updateProfileMutation.mutateAsync(payload)
      message.success(
        (response.data as { message?: string })?.message || 'Profile updated successfully',
      )
      profileStore.setStoreProp('user', response.data)
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

onMounted(() => {
  const fullPhone = profileStore.user?.phone || ''
  const { code, phone } = extractCountryCode(fullPhone)

  form.value = {
    first_name: profileStore.user?.first_name || '',
    family_name: profileStore.user?.family_name || '',
    email: profileStore.user?.email || '',
    phone: phone,
    code: code,
  } as ProfileFormValues
})
</script>
<style scoped>
:deep(.n-base-selection) {
  height: 100% !important;
}
</style>
