<template>
  <div class="flex flex-col gap-6">
    <!-- Form -->
    <n-form ref="formRef" :model="form" :rules="rules" class="flex flex-col gap-6 px-10">
      <div>
        <n-form-item path="title" :show-require-mark="false" :show-feedback="false">
          <MlbInput
            id="title"
            v-model="form.title"
            name="title"
            type="text"
            placeholder="Add a Title.."
            custom-class="w-full borderless title-input"
          />
        </n-form-item>
        <hr class="border-gray-200" />
        <n-form-item path="description" :show-require-mark="false" :show-feedback="false">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="Add a Description..."
            rows="2"
            class="w-full borderless"
          />
        </n-form-item>
      </div>

      <!-- Upload Media -->
      <div>
        <n-upload
          action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
          :default-file-list="form.media"
          list-type="image-card"
        />
      </div>

      <div>
        <n-form-item path="body" :show-require-mark="false" :show-feedback="false">
          <n-input
            v-model:value="form.body"
            type="textarea"
            placeholder="Add a Body..."
            rows="5"
            class="w-full borderless"
          />
        </n-form-item>
      </div>
      <div>
        <n-form-item
          path="open_date"
          :show-require-mark="false"
          :show-feedback="false"
          class="w-full"
        >
          <template #label>
            <label for="open_date" class="text-sm font-medium text-gray-500">Open Date</label>
          </template>
          <n-date-picker
            v-model:formatted-value="form.open_date"
            value-format="yyyy-MM-dd"
            type="date"
            class="w-full"
          />
        </n-form-item>
      </div>

      <!-- Family Member Selection -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-500">Add Family Member</label>

        <!-- Search Input -->
        <div class="relative">
          <NInput
            v-model:value="familyMemberSearch"
            placeholder="Select Family"
            class="w-full"
            size="large"
            @focus="showFamilyMemberDropdown = true"
            @blur="handleFamilyMemberBlur"
          >
            <template #suffix>
              <MlbIcon name="vuesax.linear.add" :size="16" />
            </template>
          </NInput>

          <!-- Family Member Dropdown -->
          <div
            v-if="showFamilyMemberDropdown"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-3 px-2"
          >
            <NInput
              v-model:value="familyMemberSearch"
              placeholder="Search Name"
              class="w-full"
              size="large"
              @focus="showFamilyMemberDropdown = true"
              @blur="handleFamilyMemberBlur"
            >
              <template #prefix>
                <MlbIcon name="vuesax.linear.search-normal" :size="20" class="text-gray-400" />
              </template>
            </NInput>
            <div v-if="filteredFamilyMembers.length > 0" class="mt-3 flex flex-col gap-3">
              <div
                v-for="member in filteredFamilyMembers"
                :key="member.id"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 bg-gray-50 rounded-lg"
                @click="addFamilyMember(member)"
              >
                <!-- :src="member.avatar" -->
                <NAvatar
                  :src="
                    member.avatar ||
                    `https://ui-avatars.com/api/?name=${member.name}&background=random`
                  "
                  round
                  :size="40"
                />
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ member.name }}</p>
                  <p class="text-xs text-gray-500">{{ member.email }}</p>
                </div>
                <MlbIcon name="vuesax.broke.add-square" :size="20" class="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Family Members Avatars -->
        <div v-if="form.family_members.length > 0" class="flex items-center gap-2 flex-wrap mt-2">
          <div v-for="member in form.family_members" :key="member.id" class="relative">
            <NAvatar
              :src="member.avatar"
              :fallback-src="`https://ui-avatars.com/api/?name=${member.name}&background=random`"
              round
              :size="40"
              class="border-2 border-white"
            />
            <button
              @click="removeFamilyMember(member.id)"
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Create Button -->
      <MlbButton
        type="submit"
        label="Create"
        :primary="true"
        class="w-full rounded-2xl! h-13!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage, NForm, NFormItem, NInput, NAvatar, NUpload, NDatePicker } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { timeCapsuleValidation } from '@/validations/time-capsule.validations'
import type { FamilyMember } from '@/types/family-member.types'

const { form, rules } = timeCapsuleValidation()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const familyMemberSearch = ref<string>('')
const showFamilyMemberDropdown = ref<boolean>(false)

// Mock family members data - replace with actual API call
const allFamilyMembers = ref<FamilyMember[]>([
  {
    id: '1',
    name: 'Tim Agbabiaka',
    email: 'timagbabiaka@gmail.com',
    avatar:
      'https://fastly.picsum.photos/id/451/200/300.jpg?grayscale&hmac=mvgdXy82l2LHVTEXKHEDRa0bNKiXleNaU0SKKugv1jU',
  },
  {
    id: '2',
    name: 'James Agbabiaka',
    email: 'thejamesagbabiaka@gmail.com',
    avatar:
      'https://fastly.picsum.photos/id/451/200/300.jpg?grayscale&hmac=mvgdXy82l2LHVTEXKHEDRa0bNKiXleNaU0SKKugv1jU',
  },
  {
    id: '3',
    name: 'Chukwuebuka Agbabiaka',
    email: 'chukkweagba220@gmail.com',
    avatar:
      'https://fastly.picsum.photos/id/451/200/300.jpg?grayscale&hmac=mvgdXy82l2LHVTEXKHEDRa0bNKiXleNaU0SKKugv1jU',
  },
])

const filteredFamilyMembers = computed(() => {
  if (!familyMemberSearch.value) {
    return allFamilyMembers.value.filter(
      (member) => !form.value.family_members.some((selected) => selected.id === member.id),
    )
  }
  return allFamilyMembers.value.filter(
    (member) =>
      !form.value.family_members.some((selected) => selected.id === member.id) &&
      (member.name.toLowerCase().includes(familyMemberSearch.value.toLowerCase()) ||
        member.email.toLowerCase().includes(familyMemberSearch.value.toLowerCase())),
  )
})

const addFamilyMember = (member: FamilyMember) => {
  if (!form.value.family_members.some((m) => m.id === member.id)) {
    form.value.family_members.push(member)
    familyMemberSearch.value = ''
    showFamilyMemberDropdown.value = false
  }
}

const removeFamilyMember = (memberId: string) => {
  form.value.family_members = form.value.family_members.filter((m) => m.id !== memberId)
}

const handleFamilyMemberBlur = () => {
  // Delay to allow click events to fire first
  setTimeout(() => {
    showFamilyMemberDropdown.value = false
  }, 200)
}

const emit = defineEmits<{
  (e: 'submit', data: typeof form.value): void
  (e: 'close'): void
}>()

const onFormSubmit = () => {
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }

    emit('submit', form.value)
    message.success('Announcement created successfully!')
  })
}
</script>

<style scoped>
:deep(.n-checkbox-box--checked) {
  background-color: #16a34a;
  border-color: #16a34a;
}
:deep(.n-input.borderless) {
  --n-border: none !important;
  --n-border-hover: none !important;
  --n-border-focus: none !important;
  --n-box-shadow-focus: none !important;
}

:deep(.title-input .n-input__placeholder) {
  font-size: 24px !important;
  font-weight: 700 !important;
  color: #bababa !important;
  line-height: 150% !important;
  font-family: General Sans;
}
</style>
