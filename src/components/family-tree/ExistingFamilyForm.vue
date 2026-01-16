<template>
  <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col">
    <n-form-item
      label="Enter Tree ID"
      path="tree_url"
      label-style="color: #807F94; font-weight: 500;"
    >
      <MlbInput
        v-model="form.unique_tree_id"
        placeholder="Enter the tree ID here"
        custom-class="w-full"
      />
    </n-form-item>

    <div v-if="treeDetailsIsLoading" class="flex justify-center items-center">
      <n-spin :show="!!treeDetailsIsLoading" class="mb-8">
        <template #description>
          <span class="text-sm text-gray-500"> Getting tree details... </span>
        </template>
      </n-spin>
    </div>

    <n-empty v-if="treeDetailsIsInvalid" description="Tree not found" />

    <!-- Family Tree Preview Card -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
    >
      <div
        v-if="treeDetailsIsValid"
        class="bg-secondary-50 border border-secondary-100 rounded-xl p-4 flex items-center gap-4 mb-6"
      >
        <MlbAvatar
          :options="{
            firstname_field: 'first_name',
            lastname_field: 'family_name',
            src_field: 'profile_picture_url',
            users: familyMemberOptions,
          }"
          :max="1"
          :size="56"
        />
        <div class="flex-1">
          <h3 class="font-medium text-gray-900 text-sm">{{ treeDetails?.name }}</h3>
          <p class="text-xs text-gray-600">{{ treeDetails?.num_of_children }} Members</p>
        </div>
      </div>
    </transition>

    <n-form-item
      v-if="treeDetailsIsValid"
      path="family_member"
      label-style="color: #807F94; font-weight: 500;"
      label="Select a Family Member in the Tree"
    >
      <div class="w-full">
        <NSelect
          v-model:value="form.relative_member_id"
          :options="
            familyMemberOptions.map((member) => ({
              label: `${member.first_name} ${member.family_name}`,
              value: member.id,
            }))
          "
          placeholder="Select Family Member"
          filterable
          size="large"
          class="w-full mlb-select"
        >
          <template #arrow>
            <MlbIcon name="vuesax.linear.search-normal" :size="20" />
          </template>
        </NSelect>
      </div>
    </n-form-item>

    <n-form-item
      v-if="treeDetailsIsValid"
      path="relationship"
      label-style="color: #807F94; font-weight: 500;"
      label="Select Relationship with the Family Member"
    >
      <div class="w-full">
        <NSelect
          v-model:value="form.relation_type"
          :options="relationshipOptions"
          placeholder="How are you related?"
          size="large"
          class="w-full mlb-select"
        >
          <template #arrow>
            <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
          </template>
        </NSelect>
      </div>
    </n-form-item>

    <MlbButton
      type="submit"
      label="Continue"
      :loading="isPending"
      :disabled="isPending || !treeDetailsIsValid"
      class="w-full rounded-xl! bg-primary-700! h-12! text-white! hover:bg-primary-900! mt-11.5!"
      @click="handleRequestToJoinFamilySubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInst } from 'naive-ui'
import {
  useRequestToJoinFamilyMutation,
  useGetFamilyMembersByIdentifierQuery,
} from '@/services/family-tree.service'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import { NSelect, NForm, NFormItem, NEmpty, NSpin, useMessage } from 'naive-ui'
import { familyRequestValidation } from '@/validations/family-tree.validations'
import type { FamilyMemberInterface, FamilyTreeDetails } from '@/types/family-tree.types'
import { useRouter, useRoute } from 'vue-router'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const { form, rules } = familyRequestValidation()
const requestToJoinFamilyMutation = useRequestToJoinFamilyMutation()
const isPending = computed(() => requestToJoinFamilyMutation.isPending.value)

const $emit = defineEmits<{
  (e: 'close'): void
}>()
defineProps<{
  relationshipOptions: { label: string; value: string }[]
}>()

const treeIdentifier = ref<string>('')
const treeDetails = ref<FamilyTreeDetails | null>(null)
const formRef = ref<FormInst | null>(null)
const familyMemberOptions = ref<FamilyMemberInterface[]>([])

const getFamilyMembersByIdentifierQuery = useGetFamilyMembersByIdentifierQuery(treeIdentifier, {
  enabled: false,
})

const treeDetailsIsLoading = computed(() => getFamilyMembersByIdentifierQuery.isFetching.value)
const treeDetailsIsValid = computed(() => {
  return !!familyMemberOptions.value.length
})
const treeDetailsIsInvalid = computed(() => {
  return (
    !treeDetailsIsLoading.value &&
    !familyMemberOptions.value.length &&
    form.value.unique_tree_id.length >= 10 &&
    !getFamilyMembersByIdentifierQuery.isLoading.value &&
    getFamilyMembersByIdentifierQuery.isFetched.value
  )
})

const handleRequestToJoinFamilySubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      const response = await requestToJoinFamilyMutation.mutateAsync(form.value)
      message.success(response.message || 'Request to join family sent successfully')
      if ($route.name === 'App.FamilyTreeOnboardingView') {
        $router.push({ name: 'App.FamilyTreeOnboardingView', params: { module: 'complete' } })
      } else {
        $emit('close')
      }
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

const handleFetchTreeDetails = async () => {
  const response = await getFamilyMembersByIdentifierQuery.refetch()
  const queryData = response.data
  familyMemberOptions.value = queryData?.data ?? []
  treeDetails.value = queryData?.family_tree ?? null
}

watch(
  () => form.value.unique_tree_id as string,
  (newId) => {
    if (newId.length >= 10) {
      treeIdentifier.value = newId
      handleFetchTreeDetails()
    } else {
      treeIdentifier.value = ''
      familyMemberOptions.value = []
    }
  },
  { immediate: true },
)
</script>
