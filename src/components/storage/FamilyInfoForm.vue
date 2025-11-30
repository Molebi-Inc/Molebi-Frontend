<template>
  <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col">
    <n-form-item
      label="State of Origin"
      path="relationship"
      label-style="color: #807F94; font-weight: 500;"
      required
    >
      <NSelect
        v-model:value="form.state_id"
        :options="states"
        placeholder="Select State"
        size="large"
        class="w-full"
      >
        <template #arrow>
          <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
        </template>
      </NSelect>
    </n-form-item>
    <n-form-item
      label="Community/Local Government (Optional)"
      path="community_name"
      label-style="color: #807F94; font-weight: 500;"
    >
      <MlbInput v-model="form.community_name" placeholder="Enter Community" custom-class="w-full" />
    </n-form-item>
    <n-form-item
      label="How many Children do your parent have?"
      path="num_of_children"
      label-style="color: #807F94; font-weight: 500;"
    >
      <MlbInput v-model="form.num_of_children" placeholder="0" custom-class="w-full" />
    </n-form-item>
    <n-form-item
      label="Mother's Family Name"
      path="mother_family_name"
      label-style="color: #807F94; font-weight: 500;"
    >
      <MlbInput
        v-model="form.mother_family_name"
        placeholder="Enter Mother's Family Name"
        custom-class="w-full"
      />
    </n-form-item>

    <MlbButton
      type="submit"
      :label="loading ? 'Saving...' : 'Continue'"
      :loading="loading"
      :disabled="loading"
      class="w-full rounded-xl! bg-primary-700! h-12! text-white! hover:bg-primary-700!"
      @click="handleSaveFamilyInfo"
    />
  </n-form>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { handleApiError } from '@/helpers/error.helpers'
import type { StateInterface } from '@/types/general.types'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useGetStatesQuery } from '@/services/general.service'
import { familyInfoValidation } from '@/validations/settings.validations'
import { useUpdateProfileMutation } from '@/services/authentication.services'
import { NForm, NFormItem, NSelect, useMessage, type FormInst } from 'naive-ui'
import { useProfile } from '@/composables/useProfile'

const $router = useRouter()
const message = useMessage()
const { form, rules } = familyInfoValidation()
const { refetch: refetchStates } = useGetStatesQuery()
const updateProfileMutation = useUpdateProfileMutation()
const { getProfile } = useProfile()

const formRef = ref<FormInst | null>(null)
const states = ref<{ label: string; value: number }[]>([])

const loading = computed(() => updateProfileMutation.isPending.value)

const handleSaveFamilyInfo = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      const response = await updateProfileMutation.mutateAsync(form.value)
      await getProfile()
      message.success(response.message || 'Family information saved successfully')
      $router.push({ name: 'App.StorageFolderView' })
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

const fetchStates = async () => {
  try {
    const response = await refetchStates()
    states.value =
      response.data?.data?.map((state: StateInterface) => ({
        label: state.name,
        value: state.id,
      })) ?? []
  } catch (error) {
    handleApiError(error, message)
  }
}

onMounted(async () => {
  await fetchStates()
})
</script>
