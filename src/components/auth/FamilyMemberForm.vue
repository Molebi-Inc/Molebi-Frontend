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
            Add Family Member
          </h1>
          <p class="text-neutral-600 font-normal text-sm text-center">Add a family member</p>
        </div>
        <div>
          <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-6 w-full">
            <div class="flex flex-col gap-2">
              <n-form-item path="relationship" :show-require-mark="false">
                <template #label>
                  <label for="relationship" class="text-sm font-medium text-gray-700"
                    >Relationship</label
                  >
                </template>
                <NSelect
                  v-model:value="form.relationship"
                  :options="relationshipOptions"
                  placeholder="Select a Relationship"
                  class="w-full md:w-56"
                />
              </n-form-item>
            </div>
            <div class="flex flex-col gap-2">
              <n-form-item path="first_name" :show-require-mark="false">
                <template #label>
                  <label for="first_name" class="text-sm font-medium text-gray-700"
                    >First Name</label
                  >
                </template>
                <MlbInput
                  id="first_name"
                  v-model="form.first_name"
                  name="first_name"
                  type="text"
                  placeholder="Enter First Name"
                  class="p-inputtext-sm border-gray-300 p-inputtext-placeholder:text-placeholder focus:border-primary-500"
                />
              </n-form-item>
            </div>
            <div class="flex flex-col gap-2">
              <n-form-item path="last_name" :show-require-mark="false">
                <template #label>
                  <label for="last_name" class="text-sm font-medium text-gray-700">Last Name</label>
                </template>
                <MlbInput
                  id="last_name"
                  v-model="form.last_name"
                  name="last_name"
                  type="text"
                  placeholder="Enter Last Name"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage, NForm, NFormItem, NSelect } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import BackButton from '@/components/common/BackButton.vue'
import { familyMemberValidation } from '@/validations/authentication.validations'
import { useRouter } from 'vue-router'
import { relationshipOptions } from '@/constants/relationships.constants'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'

const { form, rules } = familyMemberValidation()
const $router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Form is not valid.')
      return
    }

    $router.push({ name: 'App.HomeView' })
  })
}
</script>
