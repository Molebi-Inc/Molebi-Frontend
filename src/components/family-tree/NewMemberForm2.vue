<template>
  <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col">
    <!-- Relationship Type Selection -->
    <n-form-item
      label="Select Relationship"
      path="relation_type"
      label-style="color: #807F94; font-weight: 500;"
      required
    >
      <NSelect
        v-model:value="form.relation_type"
        :options="relationshipTypeOptions"
        placeholder="Select Relationship"
        size="large"
        class="w-full mlb-select"
        @update:value="onRelationshipTypeChange"
      >
        <template #arrow>
          <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
        </template>
      </NSelect>
    </n-form-item>

    <!-- First Name -->
    <n-form-item
      label="First Name"
      path="first_name"
      label-style="color: #807F94; font-weight: 500;"
      required
    >
      <MlbInput v-model="form.first_name" placeholder="First Name" custom-class="w-full" />
    </n-form-item>

    <!-- Same Family Name  -->
    <div class="flex items-center gap-2 mb-4">
      <NCheckbox
        v-model:checked="form.is_same_family_name"
        size="large"
        @update:checked="onSameFamilyChange"
      />
      <label class="text-sm font-medium cursor-pointer select-none text-gray-500">
        Same Family Name
      </label>
    </div>

    <!-- Family Name -->
    <n-form-item
      label="Family Name"
      path="family_name"
      label-style="color: #807F94; font-weight: 500;"
      required
    >
      <MlbInput
        v-model="form.family_name"
        placeholder="Family Name"
        :disabled="!!form.is_same_family_name"
        custom-class="w-full"
      />
    </n-form-item>

    <!-- Related Through Field (conditional) -->
    <n-form-item
      v-if="showRelatedThrough"
      path="related_through"
      label-style="color: #807F94; font-weight: 500;"
      :required="isRelatedThroughRequired"
    >
      <template #label>
        <div class="flex items-center gap-2">
          <span>{{ getRelatedThroughLabel() }}</span>
          <NTooltip v-if="getRelatedThroughTooltip()">
            <template #trigger>
              <MlbIcon name="question" :size="16" class="text-gray-400 cursor-help" />
            </template>
            {{ getRelatedThroughTooltip() }}
          </NTooltip>
        </div>
      </template>
      <NSelect
        v-model:value="form.related_through"
        :options="relatedThroughOptions"
        :placeholder="`Select ${getRelatedThroughLabel()}`"
        size="large"
        class="w-full mlb-select"
        filterable
        @update:value="onRelatedThroughChange"
      >
        <template #arrow>
          <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
        </template>
      </NSelect>
    </n-form-item>

    <!-- Parent ID Field (conditional) -->
    <n-form-item
      v-if="showParentId"
      path="parent_id"
      label-style="color: #807F94; font-weight: 500;"
      :required="isParentIdRequired"
    >
      <template #label>
        <div class="flex items-center gap-2">
          <span>Parent</span>
          <NTooltip v-if="getParentIdTooltip()">
            <template #trigger>
              <MlbIcon name="question" :size="16" class="text-gray-400 cursor-help" />
            </template>
            {{ getParentIdTooltip() }}
          </NTooltip>
        </div>
      </template>
      <NSelect
        v-model:value="form.parent_id"
        :options="parentIdOptions"
        placeholder="Select Parent"
        size="large"
        class="w-full mlb-select"
        filterable
      >
        <template #arrow>
          <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
        </template>
      </NSelect>
    </n-form-item>

    <!-- Gender Field (conditional) -->
    <n-form-item
      v-if="showGender"
      path="gender"
      label-style="color: #807F94; font-weight: 500;"
      :required="true"
    >
      <template #label>
        <div class="flex items-center gap-2">
          <span>Gender</span>
        </div>
      </template>
      <NSelect
        v-model:value="form.gender"
        :options="genderOptions"
        placeholder="Select Gender"
        size="large"
        class="w-full mlb-select"
        filterable
      >
        <template #arrow>
          <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
        </template>
      </NSelect>
    </n-form-item>

    <!-- Is Adoptive Field (conditional) -->
    <div v-if="showIsAdoptive" class="flex items-center gap-2 mb-4">
      <NCheckbox v-model:checked="form.is_adoptive" size="large">
        <label class="text-sm font-medium cursor-pointer select-none text-gray-500"
          >Adoptive Parent</label
        >
      </NCheckbox>
    </div>

    <!-- Is Former Field (conditional) -->
    <div v-if="showIsFormer" class="flex items-center gap-2 mb-4">
      <NCheckbox v-model:checked="form.is_former" size="large" />
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium cursor-pointer select-none text-gray-500">
          Former Spouse
        </label>
        <NTooltip v-if="getIsFormerTooltip()">
          <template #trigger>
            <MlbIcon name="question" :size="16" class="text-gray-400 cursor-help" />
          </template>
          {{ getIsFormerTooltip() }}
        </NTooltip>
      </div>
    </div>

    <!-- Is Deceased  -->
    <div class="flex items-center gap-2 mb-4">
      <NCheckbox v-model:checked="form.is_deceased" size="large" />
      <label class="text-sm font-medium cursor-pointer select-none text-gray-500"> Deceased </label>
    </div>

    <!-- Submit Button -->
    <MlbButton
      type="submit"
      :label="loading ? 'Adding member...' : 'Add Family Member'"
      :loading="loading"
      :disabled="loading"
      class="w-full rounded-xl! bg-primary-700! h-12! text-white! hover:bg-primary-700!"
      @click="handleSubmit"
    />
  </n-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { handleApiError } from '@/helpers/error.helpers'
import { useProfileStore } from '@/stores/profile.store'
import { useMemberForm } from '@/composables/member-form.composables'
import { useAddFamilyMemberMutation } from '@/services/family-tree.service'
import { familyMemberValidation } from '@/validations/family-tree.validations'
import { NForm, NFormItem, NSelect, NCheckbox, NTooltip, useMessage, type FormInst } from 'naive-ui'

const $emit = defineEmits<{
  (e: 'close'): void
}>()

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)

const { form, rules } = familyMemberValidation()

const {
  getDefaultGender,
  relationshipTypeOptions,
  currentRelationshipConfig,
  showRelatedThrough,
  showParentId,
  showGender,
  showIsAdoptive,
  showIsFormer,
  isRelatedThroughRequired,
  isParentIdRequired,
  getRelatedThroughLabel,
  getRelatedThroughTooltip,
  getParentIdTooltip,
  getIsFormerTooltip,
  relatedThroughOptions,
  genderOptions,
  parentIdOptions,
} = useMemberForm(() => form.value.relation_type as string)
const profileStore = useProfileStore()
const addFamilyMemberMutation = useAddFamilyMemberMutation()

const loading = computed(() => addFamilyMemberMutation.isPending.value)

const onSameFamilyChange = () => {
  if (!!form.value.is_same_family_name) {
    form.value.family_name = profileStore.userDetails?.family_name ?? ''
    return
  }
  form.value.family_name = ''
}

// Reset dependent fields when relationship type changes
const onRelationshipTypeChange = () => {
  form.value.related_through = null
  form.value.parent_id = null
  form.value.is_adoptive = false
  form.value.is_former = false
}

const onRelatedThroughChange = () => {
  // Reset parent_id if it depends on related_through
  const config = currentRelationshipConfig.value
  if (config?.fields && 'parent_id' in config.fields) {
    form.value.parent_id = null
  }
}

// Handle form submission
const handleSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Please fill in all required fields')
      return
    }

    try {
      if (form.value.relation_type === 'step_parent') {
        form.value.relation_type = form.value.gender === 'female' ? 'stepmother' : 'stepfather'
      }
      if (form.value.relation_type === 'grandparent') {
        form.value.relation_type = form.value.gender === 'female' ? 'grandmother' : 'grandfather'
      }

      const response = await addFamilyMemberMutation.mutateAsync(form.value)
      message.success(response.message || 'Family member added successfully')

      if ($route.name === 'App.FamilyTreeOnboardingView') {
        $router.push({ name: 'App.FamilyTreeOnboardingView', params: { module: 'complete' } })
      } else {
        $emit('close')
      }

      // Reset form
      form.value = {
        first_name: '',
        middle_name: '',
        family_name: '',
        is_same_family_name: false,
        nickname: '',
        relation_type: null,
        profile_picture: null,
        gender: 'male',
        related_through: null,
        parent_id: null,
        is_adoptive: false,
        is_former: false,
        is_deceased: false,
        date_of_birth: null,
      }
    } catch (error) {
      handleApiError(error, message)
    }
  })
}

watch(
  () => form.value.relation_type,
  (newRelationType) => {
    if (newRelationType) {
      form.value.gender = getDefaultGender.value || 'male'
    }
  },
  {
    immediate: true,
  },
)
</script>
