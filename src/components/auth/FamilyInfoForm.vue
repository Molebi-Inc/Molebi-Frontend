<template>
  <div class="flex justify-center items-center h-screen">
    <div class="border border-secondary-200 bg-white p-[48px] w-[522px] rounded-3xl">
      <div class="flex justify-between items-center">
        <BackButton icon="vuesax.linear.arrow-left" class="mb-6" />
        <div class="flex gap-2">
          <span class="bg-secondary-500 h-1 w-16 rounded-full"></span>
          <span class="bg-gray-100 h-1 w-16 rounded-full"></span>
        </div>
      </div>
      <div class="flex flex-col gap-[45px]">
        <div>
          <h1 class="text-neutral-900 font-semibold text-2xl mb-2 text-center">
            More Family Information
          </h1>
          <p class="text-neutral-600 font-normal text-sm text-center">
            Add more details about your family
          </p>
        </div>
        <div>
          <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-6 w-full">
            <div class="flex flex-col gap-2">
              <n-form-item path="state_of_origin" :show-require-mark="false">
                <template #label>
                  <label for="state_of_origin" class="text-sm font-medium text-gray-700"
                    >State of Origin</label
                  >
                </template>
                <MlbInput
                  id="state_of_origin"
                  v-model="form.state_of_origin"
                  name="state_of_origin"
                  type="text"
                  placeholder="Enter State of Origin"
                  class="p-inputtext-sm border-gray-300 p-inputtext-placeholder:text-placeholder focus:border-primary-500"
                />
              </n-form-item>
            </div>
            <div class="flex flex-col gap-2">
              <n-form-item path="family_name" :show-require-mark="false">
                <template #label>
                  <label for="family_name" class="text-sm font-medium text-gray-700"
                    >Family Name</label
                  >
                </template>
                <MlbInput
                  id="family_name"
                  v-model="form.family_name"
                  name="family_name"
                  type="text"
                  placeholder="Enter Family Name"
                  class="p-inputtext-sm border-gray-300 p-inputtext-placeholder:text-placeholder focus:border-primary-500"
                />
              </n-form-item>
            </div>
            <MlbButton
              type="submit"
              label="Continue"
              class="mb-4 rounded-2xl bg-green-700 py-4 px-7 text-white w-100"
              @click="onFormSubmit"
            />
          </n-form>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage, NForm, NFormItem } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import BackButton from '@/components/common/BackButton.vue'
import { familyInfoValidation } from '@/validations/authentication.validations'
import { useRouter } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authentication.store'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'

const { form, rules } = familyInfoValidation()
const authenticationStore = useAuthenticationStore()
const $router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Form is not valid.')
      return
    }

    authenticationStore.setStoreProp('signupForm', form.value)
    $router.push({ name: 'Guests.OnboardingView', params: { module: 'branch' } })
  })
}
</script>
