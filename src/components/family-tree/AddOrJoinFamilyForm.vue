<template>
  <div class="flex flex-col h-full">
    <!-- Initial Selection View -->
    <div v-if="!selectedMode" class="flex flex-col h-full justify-center animate-fade-in">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">Welcome to Family Tree</h2>
        <p class="text-gray-500 text-lg">Choose how you want to get started</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Create Tree Card -->
        <button
          @click="selectedMode = 'add'"
          class="group relative p-8 rounded-2xl border-2 border-gray-100 bg-white hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 text-left flex flex-col gap-4"
        >
          <div
            class="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300"
          >
            <MlbIcon
              name="vuesax.bold.add"
              class="text-primary-600 group-hover:text-white transition-colors duration-300"
              :size="28"
            />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Create New Tree</h3>
            <p class="text-gray-500 leading-relaxed">
              Start a new family tree from scratch. You'll be the first member.
            </p>
          </div>
          <div class="mt-auto pt-4 flex items-center text-primary-600 font-medium">
            <span>Get Started</span>
            <MlbIcon
              name="vuesax.linear.arrow-right"
              class="ml-2 group-hover:translate-x-1 transition-transform"
              :size="20"
            />
          </div>
        </button>

        <!-- Join Tree Card -->
        <button
          @click="selectedMode = 'join'"
          class="group relative p-8 rounded-2xl border-2 border-gray-100 bg-white hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 text-left flex flex-col gap-4"
        >
          <div
            class="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300"
          >
            <MlbIcon
              name="vuesax.bold.people"
              class="text-orange-500 group-hover:text-white transition-colors duration-300"
              :size="28"
            />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Join Existing Tree</h3>
            <p class="text-gray-500 leading-relaxed">
              Have a family link? Join your family's existing tree here.
            </p>
          </div>
          <div class="mt-auto pt-4 flex items-center text-orange-500 font-medium">
            <span>Join Now</span>
            <MlbIcon
              name="vuesax.linear.arrow-right"
              class="ml-2 group-hover:translate-x-1 transition-transform"
              :size="20"
            />
          </div>
        </button>
      </div>
    </div>

    <!-- Form View -->
    <div v-else class="animate-slide-up">
      <button
        @click="selectedMode = null"
        class="mb-8 flex items-center text-gray-500 hover:text-gray-900 transition-colors"
      >
        <MlbIcon name="vuesax.linear.arrow-left" class="mr-2" :size="20" />
        <span class="font-medium">Back to options</span>
      </button>

      <div class="bg-white">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {{ selectedMode === 'add' ? 'Create Your Profile' : 'Join Family Tree' }}
          </h2>
          <p class="text-gray-500">
            {{
              selectedMode === 'add'
                ? 'Enter your details to start your family tree.'
                : 'Enter the tree URL and select your profile.'
            }}
          </p>
        </div>

        <!-- Add New Member Form -->
        <n-form
          v-if="selectedMode === 'add'"
          ref="addMemberFormRef"
          :model="addMemberForm"
          :rules="addMemberRules"
          class="flex flex-col gap-5"
        >
          <div class="grid md:grid-cols-2 gap-5">
            <n-form-item path="first_name" :show-label="false">
              <MlbInput
                v-model="addMemberForm.first_name"
                placeholder="First Name"
                label="First Name"
                custom-class="w-full"
              />
            </n-form-item>
            <n-form-item path="middle_name" :show-label="false">
              <MlbInput
                v-model="addMemberForm.middle_name"
                placeholder="Middle Name"
                label="Middle Name (Optional)"
                custom-class="w-full"
              />
            </n-form-item>
          </div>

          <div class="grid md:grid-cols-2 gap-5">
            <n-form-item path="family_name" :show-label="false">
              <MlbInput
                v-model="addMemberForm.family_name"
                placeholder="Family Name"
                label="Family Name"
                custom-class="w-full"
              />
            </n-form-item>
            <n-form-item path="nick_name" :show-label="false">
              <MlbInput
                v-model="addMemberForm.nick_name"
                placeholder="Nick Name"
                label="Nick Name (Optional)"
                custom-class="w-full"
              />
            </n-form-item>
          </div>

          <n-form-item path="relationship" :show-label="false">
            <div class="w-full">
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Relationship to Root</label
              >
              <NSelect
                v-model:value="addMemberForm.relationship"
                :options="relationshipOptions"
                placeholder="Select Relationship"
                size="large"
                class="w-full"
              >
                <template #arrow>
                  <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
                </template>
              </NSelect>
            </div>
          </n-form-item>

          <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <NCheckbox v-model:checked="addMemberForm.same_family" size="large" />
            <label class="text-sm font-medium text-gray-700 cursor-pointer select-none">
              Use this as my main family tree
            </label>
          </div>

          <MlbButton
            type="submit"
            label="Create Tree"
            class="w-full rounded-xl! bg-primary-600! h-12! text-white! mt-4 hover:bg-primary-700! shadow-lg shadow-primary-600/20"
            @click="handleAddMemberSubmit"
          />
        </n-form>

        <!-- Join Existing Tree Form -->
        <n-form
          v-if="selectedMode === 'join'"
          ref="joinTreeFormRef"
          :model="joinTreeForm"
          :rules="joinTreeRules"
          class="flex flex-col gap-6"
        >
          <n-form-item path="tree_url" :show-label="false">
            <MlbInput
              v-model="joinTreeForm.tree_url"
              placeholder="Paste the tree link here"
              label="Tree URL"
              custom-class="w-full"
            />
          </n-form-item>

          <!-- Family Tree Preview Card -->
          <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
          >
            <div
              v-if="joinTreeForm.tree_url"
              class="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4"
            >
              <NAvatar
                :size="56"
                round
                src="https://ui-avatars.com/api/?name=The+Huth&background=random"
                class="ring-4 ring-white"
              />
              <div class="flex-1">
                <h3 class="font-bold text-gray-900">The Huth's Family</h3>
                <p class="text-sm text-orange-600 font-medium">234 Members • Created 2023</p>
              </div>
              <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <MlbIcon name="vuesax.bold.tick-circle" class="text-green-500" :size="20" />
              </div>
            </div>
          </transition>

          <n-form-item path="family_member" :show-label="false">
            <div class="w-full">
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Select Your Profile</label
              >
              <NSelect
                v-model:value="joinTreeForm.family_member"
                :options="familyMemberOptions"
                placeholder="Search for your name..."
                filterable
                size="large"
                class="w-full"
              >
                <template #arrow>
                  <MlbIcon name="vuesax.linear.search-normal" :size="20" />
                </template>
              </NSelect>
            </div>
          </n-form-item>

          <n-form-item path="relationship" :show-label="false">
            <div class="w-full">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Relationship</label>
              <NSelect
                v-model:value="joinTreeForm.relationship"
                :options="relationshipOptions"
                placeholder="How are you related?"
                size="large"
                class="w-full"
              >
                <template #arrow>
                  <MlbIcon name="vuesax.linear.arrow-down-2" :size="20" />
                </template>
              </NSelect>
            </div>
          </n-form-item>

          <MlbButton
            type="submit"
            label="Join Tree"
            class="w-full rounded-xl! bg-orange-500! h-12! text-white! mt-4 hover:bg-orange-600! shadow-lg shadow-orange-500/20"
            @click="handleJoinTreeSubmit"
          />
        </n-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage, NForm, NFormItem, NSelect, NCheckbox, NAvatar } from 'naive-ui'
import type { FormInst, FormItemRule } from 'naive-ui'
import { z } from 'zod'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { relationshipOptions } from '@/constants/relationships.constants'

const message = useMessage()
const selectedMode = ref<'add' | 'join' | null>(null)
const addMemberFormRef = ref<FormInst | null>(null)
const joinTreeFormRef = ref<FormInst | null>(null)

// Add New Member Form
const addMemberForm = ref({
  relationship: '',
  first_name: '',
  middle_name: '',
  nick_name: '',
  family_name: '',
  same_family: false,
})

const addMemberSchema = z.object({
  relationship: z.string().min(1, { message: 'Relationship is required.' }),
  first_name: z.string().min(1, { message: 'First name is required.' }),
  middle_name: z.string().optional(),
  nick_name: z.string().optional(),
  family_name: z.string().min(1, { message: 'Family name is required.' }),
})

const addMemberRules = {
  relationship: {
    required: true,
    trigger: 'change',
    validator: async (_rule: FormItemRule, value: string) => {
      try {
        addMemberSchema.pick({ relationship: true }).parse({ relationship: value })
        return Promise.resolve()
      } catch (err: unknown) {
        const messageText =
          err instanceof z.ZodError ? err.issues?.[0]?.message : 'Relationship is required.'
        return Promise.reject(messageText)
      }
    },
  },
  first_name: {
    required: true,
    trigger: 'input',
    validator: async (_rule: FormItemRule, value: string) => {
      try {
        addMemberSchema.pick({ first_name: true }).parse({ first_name: value })
        return Promise.resolve()
      } catch (err: unknown) {
        const messageText =
          err instanceof z.ZodError ? err.issues?.[0]?.message : 'First name is required.'
        return Promise.reject(messageText)
      }
    },
  },
  family_name: {
    required: true,
    trigger: 'input',
    validator: async (_rule: FormItemRule, value: string) => {
      try {
        addMemberSchema.pick({ family_name: true }).parse({ family_name: value })
        return Promise.resolve()
      } catch (err: unknown) {
        const messageText =
          err instanceof z.ZodError ? err.issues?.[0]?.message : 'Family name is required.'
        return Promise.reject(messageText)
      }
    },
  },
}

// Join Existing Tree Form
const joinTreeForm = ref({
  tree_url: '',
  family_member: '',
  relationship: '',
})

const joinTreeSchema = z.object({
  tree_url: z.string().min(1, { message: 'Tree URL is required.' }),
  family_member: z.string().min(1, { message: 'Family member is required.' }),
  relationship: z.string().min(1, { message: 'Relationship is required.' }),
})

const joinTreeRules = {
  tree_url: {
    required: true,
    trigger: 'input',
    validator: async (_rule: FormItemRule, value: string) => {
      try {
        joinTreeSchema.pick({ tree_url: true }).parse({ tree_url: value })
        return Promise.resolve()
      } catch (err: unknown) {
        const messageText =
          err instanceof z.ZodError ? err.issues?.[0]?.message : 'Tree URL is required.'
        return Promise.reject(messageText)
      }
    },
  },
  family_member: {
    required: true,
    trigger: 'change',
    validator: async (_rule: FormItemRule, value: string) => {
      try {
        joinTreeSchema.pick({ family_member: true }).parse({ family_member: value })
        return Promise.resolve()
      } catch (err: unknown) {
        const messageText =
          err instanceof z.ZodError ? err.issues?.[0]?.message : 'Family member is required.'
        return Promise.reject(messageText)
      }
    },
  },
  relationship: {
    required: true,
    trigger: 'change',
    validator: async (_rule: FormItemRule, value: string) => {
      try {
        joinTreeSchema.pick({ relationship: true }).parse({ relationship: value })
        return Promise.resolve()
      } catch (err: unknown) {
        const messageText =
          err instanceof z.ZodError ? err.issues?.[0]?.message : 'Relationship is required.'
        return Promise.reject(messageText)
      }
    },
  },
}

// Mock family member options - replace with actual API call
const familyMemberOptions = ref([
  { label: 'Michael Ezeoke Huth', value: 'michael_ezeoke_huth' },
  { label: 'John Doe', value: 'john_doe' },
  { label: 'Jane Smith', value: 'jane_smith' },
])

const emit = defineEmits<{
  (e: 'add-member', data: typeof addMemberForm.value): void
  (e: 'join-tree', data: typeof joinTreeForm.value): void
}>()

const handleAddMemberSubmit = () => {
  addMemberFormRef.value?.validate((errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }
    message.success('Family tree created successfully!')
    emit('add-member', addMemberForm.value)
  })
}

const handleJoinTreeSubmit = () => {
  joinTreeFormRef.value?.validate((errors) => {
    if (errors) {
      message.error('Please fill in all required fields.')
      return
    }
    message.success('Joined tree successfully!')
    emit('join-tree', joinTreeForm.value)
  })
}
</script>

<style scoped>
:deep(.n-select .n-base-selection) {
  border-radius: 12px;
  min-height: 48px;
}
:deep(.n-select .n-base-selection-label) {
  height: 48px;
  display: flex;
  align-items: center;
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
