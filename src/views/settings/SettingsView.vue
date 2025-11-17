<template>
  <div class="flex h-full bg-white">
    <!-- Sidebar Navigation -->
    <aside class="w-64 border-r border-gray-200 bg-white p-6">
      <nav class="space-y-1">
        <button
          v-for="item in settingsItems"
          :key="item.id"
          @click="activeSection = item.id"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-colors',
            activeSection === item.id
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50',
          ]"
        >
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Profile & Account -->
      <div v-if="activeSection === 'profile'" class="max-w-4xl">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Profile</h1>

        <!-- User Profile Header -->
        <div class="flex items-center gap-4 mb-8">
          <div
            class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
          >
            <img
              src="https://ui-avatars.com/api/?name=Bode+Aboderin&background=random&size=64"
              alt="Profile"
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Bode Aboderin</h2>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
            <button
              @click="isEditingProfile = !isEditingProfile"
              class="text-primary-700 hover:text-primary-800 font-medium"
            >
              {{ isEditingProfile ? 'Cancel' : 'Edit' }}
            </button>
          </div>

          <n-form
            v-if="isEditingProfile"
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            class="space-y-4"
          >
            <div class="grid grid-cols-2 gap-4">
              <n-form-item label="First Name" path="firstName">
                <MlbInput
                  v-model="profileForm.firstName"
                  id="firstName"
                  placeholder="Enter First Name"
                  custom-class="border-gray-300 focus:border-primary-500"
                />
              </n-form-item>
              <n-form-item label="Last Name" path="lastName">
                <MlbInput
                  v-model="profileForm.lastName"
                  id="lastName"
                  placeholder="Enter Last Name"
                  custom-class="border-gray-300 focus:border-primary-500"
                />
              </n-form-item>
            </div>
            <n-form-item label="Email Address" path="email">
              <MlbInput
                v-model="profileForm.email"
                id="email"
                type="text"
                placeholder="Enter Email Address"
                custom-class="border-gray-300 focus:border-primary-500"
              />
            </n-form-item>
            <n-form-item label="Phone" path="phone">
              <MlbInput
                v-model="profileForm.phone"
                id="phone"
                placeholder="Enter Phone Number"
                custom-class="border-gray-300 focus:border-primary-500"
              />
            </n-form-item>
          </n-form>

          <div v-else class="grid grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">First Name</label>
              <p class="text-gray-900">Olabode</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
              <p class="text-gray-900">Aboderin</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <p class="text-gray-900">olabodeaboderin@gmail.com</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Phone</label>
              <p class="text-gray-900">+234 081 267 8979</p>
            </div>
          </div>
        </div>

        <!-- Delete Account Button -->
        <div class="mt-8">
          <button class="text-red-600 hover:text-red-700 font-medium">Delete Account</button>
        </div>
      </div>

      <!-- Tree Settings -->
      <div v-if="activeSection === 'tree'" class="max-w-4xl">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Tree</h1>

        <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div class="flex items-center justify-between">
            <label class="text-base font-medium text-gray-900">Show relationship titles</label>
            <n-switch v-model:value="treeSettings.showRelationshipTitles" />
          </div>
          <div class="flex items-center justify-between">
            <label class="text-base font-medium text-gray-900">Show full names</label>
            <n-switch v-model:value="treeSettings.showFullNames" />
          </div>
          <div class="flex items-center justify-between">
            <label class="text-base font-medium text-gray-900">Show only direct connections</label>
            <n-switch v-model:value="treeSettings.showOnlyDirectConnections" />
          </div>
        </div>

        <div class="mt-8 flex justify-center">
          <MlbButton
            label="Save Changes"
            primary
            class="rounded-lg! bg-primary-700! text-white! px-8! py-2.5!"
            @click="saveTreeSettings"
          />
        </div>
      </div>

      <!-- Privacy & Permissions -->
      <div v-if="activeSection === 'privacy'" class="max-w-4xl">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Privacy & Permissions</h1>

        <!-- Who Can View -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Who Can View</h3>
          <div class="space-y-3">
            <n-checkbox
              v-model:checked="privacySettings.viewOnlyMe"
              :checked-value="true"
              :unchecked-value="false"
              @update:checked="handleViewChange('onlyMe')"
            >
              Only Me
            </n-checkbox>
            <n-checkbox
              v-model:checked="privacySettings.viewFamilyMembers"
              :checked-value="true"
              :unchecked-value="false"
              @update:checked="handleViewChange('family')"
            >
              Family Members
            </n-checkbox>
            <n-checkbox
              v-model:checked="privacySettings.viewExtendedFamilies"
              :checked-value="true"
              :unchecked-value="false"
              @update:checked="handleViewChange('extended')"
            >
              Extended Families
            </n-checkbox>
            <n-checkbox
              v-model:checked="privacySettings.viewPublicLink"
              :checked-value="true"
              :unchecked-value="false"
              @update:checked="handleViewChange('public')"
            >
              Public Link (View Only)
            </n-checkbox>
          </div>
        </div>

        <!-- Who Can Edit -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Who Can Edit</h3>
          <div class="space-y-3">
            <n-checkbox
              v-model:checked="privacySettings.editOnlyAdmins"
              :checked-value="true"
              :unchecked-value="false"
              @update:checked="handleEditChange('admins')"
            >
              Only Admins
            </n-checkbox>
            <n-checkbox
              v-model:checked="privacySettings.editAnyoneInvited"
              :checked-value="true"
              :unchecked-value="false"
              @update:checked="handleEditChange('invited')"
            >
              Anyone I Invite
            </n-checkbox>
          </div>
        </div>

        <div class="mt-8 flex justify-center">
          <MlbButton
            label="Save Changes"
            primary
            class="rounded-lg! bg-primary-700! text-white! px-8! py-2.5!"
            @click="savePrivacySettings"
          />
        </div>
      </div>

      <!-- Notification -->
      <div v-if="activeSection === 'notification'" class="max-w-4xl">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Notification</h1>

        <!-- General Notifications -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">General</h3>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <label class="text-base font-medium text-gray-900">Birthdays & Anniversaries</label>
              <n-switch v-model:value="notificationSettings.birthdaysAndAnniversaries" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-base font-medium text-gray-900">New Family Member Added</label>
              <n-switch v-model:value="notificationSettings.newFamilyMemberAdded" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-base font-medium text-gray-900">Photos or Memories Added</label>
              <n-switch v-model:value="notificationSettings.photosOrMemoriesAdded" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-base font-medium text-gray-900">Tree Updates / Invites</label>
              <n-switch v-model:value="notificationSettings.treeUpdatesInvites" />
            </div>
          </div>
        </div>

        <!-- Delivery Channels -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Delivery Channels</h3>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <label class="text-base font-medium text-gray-900">Email Notifications</label>
              <n-switch v-model:value="notificationSettings.emailNotifications" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-base font-medium text-gray-900">Push Notifications</label>
              <n-switch v-model:value="notificationSettings.pushNotifications" />
            </div>
          </div>
        </div>
      </div>

      <!-- Help -->
      <div v-if="activeSection === 'help'" class="max-w-4xl">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Help</h1>

        <h2 class="text-xl font-semibold text-gray-900 mb-4">FAQs</h2>

        <n-collapse v-model:expanded-names="expandedFaqs" accordion>
          <n-collapse-item v-for="faq in faqs" :key="faq.id" :name="faq.id" :title="faq.question">
            <div class="text-gray-700">{{ faq.answer }}</div>
          </n-collapse-item>
        </n-collapse>
      </div>

      <!-- About -->
      <div v-if="activeSection === 'about'" class="max-w-4xl">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">About</h1>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">About Molebi</h3>
          <div class="text-gray-700">
            <!-- About content will go here -->
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  NForm,
  NFormItem,
  NSwitch,
  NCheckbox,
  NCollapse,
  NCollapseItem,
  useMessage,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'

const message = useMessage()

// Active section state
const activeSection = ref<'profile' | 'tree' | 'privacy' | 'notification' | 'help' | 'about'>(
  'profile',
)

// Settings navigation items
const settingsItems = [
  { id: 'profile' as const, label: 'Profile & Account' },
  { id: 'tree' as const, label: 'Tree Settings' },
  { id: 'privacy' as const, label: 'Privacy & Permissions' },
  { id: 'notification' as const, label: 'Notification' },
  { id: 'help' as const, label: 'Help' },
  { id: 'about' as const, label: 'About' },
]

// Profile & Account
const isEditingProfile = ref(false)
const profileFormRef = ref<FormInst | null>(null)
const profileForm = reactive({
  firstName: 'Olabode',
  lastName: 'Aboderin',
  email: 'olabodeaboderin@gmail.com',
  phone: '+234 081 267 8979',
})

const profileRules: FormRules = {
  firstName: [{ required: true, message: 'First name is required', trigger: 'blur' }],
  lastName: [{ required: true, message: 'Last name is required', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
  ],
  phone: [{ required: true, message: 'Phone is required', trigger: 'blur' }],
}

// Tree Settings
const treeSettings = reactive({
  showRelationshipTitles: true,
  showFullNames: false,
  showOnlyDirectConnections: false,
})

const saveTreeSettings = () => {
  message.success('Tree settings saved successfully')
}

// Privacy & Permissions
const privacySettings = reactive({
  viewOnlyMe: true,
  viewFamilyMembers: false,
  viewExtendedFamilies: false,
  viewPublicLink: false,
  editOnlyAdmins: true,
  editAnyoneInvited: false,
})

const handleViewChange = (type: string) => {
  // Reset all view options to ensure mutual exclusivity
  if (type === 'onlyMe') {
    if (privacySettings.viewOnlyMe) {
      privacySettings.viewFamilyMembers = false
      privacySettings.viewExtendedFamilies = false
      privacySettings.viewPublicLink = false
    }
  } else if (type === 'family') {
    if (privacySettings.viewFamilyMembers) {
      privacySettings.viewOnlyMe = false
      privacySettings.viewExtendedFamilies = false
      privacySettings.viewPublicLink = false
    }
  } else if (type === 'extended') {
    if (privacySettings.viewExtendedFamilies) {
      privacySettings.viewOnlyMe = false
      privacySettings.viewFamilyMembers = false
      privacySettings.viewPublicLink = false
    }
  } else if (type === 'public') {
    if (privacySettings.viewPublicLink) {
      privacySettings.viewOnlyMe = false
      privacySettings.viewFamilyMembers = false
      privacySettings.viewExtendedFamilies = false
    }
  }
}

const handleEditChange = (type: string) => {
  if (type === 'admins') {
    if (privacySettings.editOnlyAdmins) {
      privacySettings.editAnyoneInvited = false
    }
  } else if (type === 'invited') {
    if (privacySettings.editAnyoneInvited) {
      privacySettings.editOnlyAdmins = false
    }
  }
}

const savePrivacySettings = () => {
  message.success('Privacy settings saved successfully')
}

// Notification Settings
const notificationSettings = reactive({
  birthdaysAndAnniversaries: true,
  newFamilyMemberAdded: false,
  photosOrMemoriesAdded: false,
  treeUpdatesInvites: false,
  emailNotifications: true,
  pushNotifications: false,
})

// Help FAQs
const expandedFaqs = ref<string[]>(['faq1'])
const faqs = [
  {
    id: 'faq1',
    question: 'Can I upload photos and documents to my family tree?',
    answer:
      'To create your family tree, simply sign up for an account, and start adding family members by entering their names, birthdates, and relationships. You can easily add new branches and expand your tree by linking relatives together.',
  },
  {
    id: 'faq2',
    question: 'Can I share my family tree with others?',
    answer:
      'Yes, you can share your family tree with others by adjusting your privacy settings. You can choose to share with family members, extended families, or create a public link for viewing.',
  },
  {
    id: 'faq3',
    question: 'Is there a limit to how many family members I can add?',
    answer:
      'No, there is no limit to how many family members you can add to your family tree. You can expand your tree as much as you need.',
  },
]
</script>

<style scoped></style>
