<template>
  <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col">
    <n-form-item
      label="Select Relationship"
      path="relationship"
      label-style="color: #807F94; font-weight: 500;"
      required
    >
      <NSelect
        v-model:value="form.relation_type"
        :options="relationshipOptions"
        placeholder="Select Relationship"
        size="large"
        class="w-full"
      >
        <template #arrow>
          <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
        </template>
      </NSelect>
    </n-form-item>
    <n-form-item
      label="First Name"
      path="first_name"
      label-style="color: #807F94; font-weight: 500;"
    >
      <MlbInput v-model="form.first_name" placeholder="First Name" custom-class="w-full" />
    </n-form-item>
    <n-form-item
      label="Middle Name"
      path="middle_name"
      label-style="color: #807F94; font-weight: 500;"
    >
      <MlbInput v-model="form.middle_name" placeholder="Middle Name" custom-class="w-full" />
    </n-form-item>
    <n-form-item label="Nick Name" path="nick_name" label-style="color: #807F94; font-weight: 500;">
      <MlbInput v-model="form.nickname" placeholder="Nick Name" custom-class="w-full" />
    </n-form-item>
    <n-form-item
      label="Family Name"
      path="family_name"
      label-style="color: #807F94; font-weight: 500;"
    >
      <MlbInput
        v-model="form.family_name"
        :disabled="!!form.is_same_family_name"
        placeholder="Family Name / Surname"
        custom-class="w-full"
      />
    </n-form-item>

    <div class="flex items-center gap-2 mb-11.5">
      <NCheckbox
        v-model:checked="form.is_same_family_name"
        size="large"
        @update:checked="onSameFamilyChange"
      />
      <label class="text-sm font-medium cursor-pointer select-none text-gray-500">
        Same Family as mine
      </label>
    </div>

    <MlbButton
      type="submit"
      :label="loading ? 'Adding member...' : 'Continue'"
      :loading="loading"
      :disabled="loading"
      class="w-full rounded-xl! bg-primary-700! h-12! text-white! hover:bg-primary-700!"
      @click="handleAddMemberSubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { NForm, NFormItem, NSelect, NCheckbox, useMessage, type FormInst } from 'naive-ui'
import { familyMemberValidation } from '@/validations/family-tree.validations'
import { useAddFamilyMemberMutation } from '@/services/family-tree.service'
import { handleApiError } from '@/helpers/error.helpers'
import { useProfileStore } from '@/stores/profile.store'
import { useRouter } from 'vue-router'

defineProps<{
  relationshipOptions: { label: string; value: string }[]
}>()

const $router = useRouter()
const message = useMessage()
const profileStore = useProfileStore()
const { form, rules } = familyMemberValidation()
const addFamilyMemberMutation = useAddFamilyMemberMutation()

const formRef = ref<FormInst | null>(null)

const loading = computed(() => addFamilyMemberMutation.isPending.value)

const onSameFamilyChange = () => {
  if (!!form.value.is_same_family_name) {
    form.value.family_name = profileStore.userDetails?.family_name ?? ''
    return
  }
  form.value.family_name = ''
}

const handleAddMemberSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      const response = await addFamilyMemberMutation.mutateAsync(form.value)
      message.success(response.message || 'Family member added successfully')
      $router.push({ name: 'App.FamilyTreeOnboardingView', params: { module: 'complete' } })
    } catch (error) {
      handleApiError(error, message)
    }
  })
}
</script>
