<template>
  <section class="h-full flex flex-col">
    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-4 md:p-8">
      <!-- Empty State -->
      <div
        v-if="vaultFiles.length === 0 && !isLocked"
        class="flex flex-col items-center justify-center h-full px-4"
      >
        <div class="mb-4 md:mb-6">
          <MlbIcon
            :name="isLargeScreen ? 'vuesax.linear.folder' : 'vuesax.linear.camera'"
            :size="isLargeScreen ? 120 : 80"
            color="#A1A1A1"
          />
        </div>
        <h3 class="text-base md:text-lg text-gray-500 font-medium mb-2">No files yet</h3>
        <p class="text-gray-400 text-sm text-center max-w-md mb-6 md:mb-0">
          Your vault keeps precious memories, files, and voice notes safe - locked away for your
          eyes only.
        </p>
        <!-- Mobile Upload Button (shown only in empty state on mobile) -->
        <MlbButton
          v-if="!isLargeScreen"
          label="Upload File"
          primary
          block
          class="mt-6 rounded-lg! bg-primary-700! text-white! py-3! max-w-xs!"
          @click="showUploadModal = true"
        />
      </div>

      <!-- File Gallery -->
      <div
        v-else-if="vaultFiles.length > 0 && !isLocked"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="file in vaultFiles"
          :key="file.id"
          class="relative group bg-white rounded-lg border border-gray-200 p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer active:scale-95 md:active:scale-100"
          @click="openFilePreview(file)"
        >
          <!-- File Thumbnail/Icon -->
          <div
            class="aspect-square mb-3 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
          >
            <img
              v-if="file.type === 'image'"
              :src="file.thumbnail || file.url"
              :alt="file.title"
              class="w-full h-full object-cover"
            />
            <div
              v-else-if="file.type === 'audio'"
              class="flex items-center justify-center w-full h-full"
            >
              <MlbIcon name="vuesax.linear.music" :size="48" color="#02BF83" />
            </div>
            <div v-else class="flex items-center justify-center w-full h-full">
              <MlbIcon name="vuesax.linear.document" :size="48" color="#A1A1A1" />
            </div>
          </div>

          <!-- File Info -->
          <h4 class="text-sm font-medium text-gray-900 truncate mb-1">
            {{ file.title || 'Untitled' }}
          </h4>
          <p class="text-xs text-gray-500 truncate">{{ formatDate(file.date) }}</p>

          <!-- Actions Menu -->
          <div
            class="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <button
              @click.stop="openDeleteConfirmation(file)"
              class="p-1.5 md:p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
              aria-label="Delete file"
            >
              <MlbIcon name="vuesax.linear.trash" :size="18" class="md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Locked State (Before PIN Entry) -->
      <div v-if="isLocked" class="flex flex-col items-center justify-center h-full px-4 py-8">
        <div class="mb-4 md:mb-6">
          <MlbIcon
            name="vuesax.linear.security-safe"
            :size="isLargeScreen ? 120 : 80"
            color="#A1A1A1"
          />
        </div>
        <h3 class="text-base md:text-lg text-gray-500 font-medium mb-2">Vault is Locked</h3>
        <p class="text-gray-400 text-sm text-center max-w-md mb-6">
          Enter your PIN to access your vault
        </p>
        <MlbButton
          label="Enter PIN"
          primary
          block
          :class="[
            'rounded-lg! bg-primary-700! text-white! py-3!',
            isLargeScreen ? 'px-8! py-2.5!' : 'max-w-xs!',
          ]"
          @click="showPinModal = true"
        />
      </div>
    </div>

    <!-- Upload Button (Desktop only, mobile shows in empty state) -->
    <div v-if="!isLocked && isLargeScreen" class="fixed bottom-8 right-8">
      <button
        @click="showUploadModal = true"
        class="w-14 h-14 bg-primary-700 text-white rounded-full shadow-lg hover:bg-primary-800 transition-colors flex items-center justify-center"
        aria-label="Upload file"
      >
        <MlbIcon name="vuesax.linear.add" :size="24" />
      </button>
    </div>

    <!-- Mobile Upload Button (Bottom, when files exist) -->
    <div
      v-if="!isLocked && !isLargeScreen && vaultFiles.length > 0"
      class="fixed bottom-6 left-4 right-4"
    >
      <MlbButton
        label="Upload File"
        primary
        block
        class="rounded-lg! bg-primary-700! text-white! py-3! shadow-lg!"
        @click="showUploadModal = true"
      />
    </div>

    <!-- PIN Entry Modal (Desktop) -->
    <MlbModal v-if="isLargeScreen" v-model:show="showPinModal" class="rounded-3xl! max-w-md!">
      <template #header>
        <h2 class="text-2xl font-semibold text-gray-900">Enter your PIN</h2>
      </template>

      <div class="py-6">
        <n-form ref="pinFormRef" :model="pinForm" :rules="pinRules" class="space-y-6">
          <n-form-item path="pin" :show-require-mark="false" :show-feedback="false">
            <MlbInputOtp
              v-model="pinForm.pin"
              name="pin"
              :length="4"
              :gap="24"
              size="large"
              mask
              custom-class="border-gray-300 focus:border-primary-500"
              @finish="handlePinSubmit"
            />
          </n-form-item>
          <div v-if="pinError" class="text-center">
            <p class="text-red-600 text-sm">{{ pinError }}</p>
          </div>
        </n-form>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <MlbButton
            label="Unlock"
            primary
            class="rounded-lg! bg-primary-700! text-white! px-8! py-2.5!"
            @click="handlePinSubmit"
          />
        </div>
      </template>
    </MlbModal>

    <!-- PIN Entry Drawer (Mobile) -->
    <n-drawer
      v-if="!isLargeScreen"
      v-model:show="showPinModal"
      placement="bottom"
      :height="400"
      class="rounded-t-3xl!"
    >
      <n-drawer-content>
        <div class="py-4">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Enter your PIN</h2>
          <n-form ref="pinFormRef" :model="pinForm" :rules="pinRules" class="space-y-6">
            <n-form-item path="pin" :show-require-mark="false" :show-feedback="false">
              <MlbInputOtp
                v-model="pinForm.pin"
                name="pin"
                :length="4"
                :gap="24"
                size="large"
                mask
                custom-class="border-gray-300 focus:border-primary-500"
                @finish="handlePinSubmit"
              />
            </n-form-item>
            <div v-if="pinError" class="text-center">
              <p class="text-red-600 text-sm">{{ pinError }}</p>
            </div>
          </n-form>
          <div class="mt-8">
            <MlbButton
              label="Unlock"
              primary
              block
              class="rounded-lg! bg-primary-700! text-white! py-3!"
              @click="handlePinSubmit"
            />
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- PIN Confirmed Modal (Desktop) -->
    <MlbModal v-if="isLargeScreen" v-model:show="showPinConfirmed" class="rounded-3xl! max-w-md!">
      <template #header>
        <h2 class="text-2xl font-semibold text-gray-900">Vault Unlocked</h2>
      </template>

      <div class="py-6">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <MlbIcon name="vuesax.linear.tick-circle" :size="32" color="#02BF5E" />
          </div>
        </div>
        <p class="text-gray-700 text-center">Your vault has been successfully unlocked.</p>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <MlbButton
            label="Continue"
            primary
            class="rounded-lg! bg-primary-700! text-white! px-8! py-2.5!"
            @click="
              () => {
                showPinConfirmed = false
                isLocked = false
              }
            "
          />
        </div>
      </template>
    </MlbModal>

    <!-- PIN Confirmed Drawer (Mobile) -->
    <n-drawer
      v-if="!isLargeScreen"
      v-model:show="showPinConfirmed"
      placement="bottom"
      :height="300"
      class="rounded-t-3xl!"
    >
      <n-drawer-content>
        <div class="py-4">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <MlbIcon name="vuesax.linear.tick-circle" :size="32" color="#02BF5E" />
            </div>
          </div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-2 text-center">Vault Unlocked</h2>
          <p class="text-gray-700 text-center mb-6">Your vault has been successfully unlocked.</p>
          <MlbButton
            label="Continue"
            primary
            block
            class="rounded-lg! bg-primary-700! text-white! py-3!"
            @click="
              () => {
                showPinConfirmed = false
                isLocked = false
              }
            "
          />
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- Upload File Modal (Desktop) -->
    <MlbModal v-if="isLargeScreen" v-model:show="showUploadModal" class="rounded-3xl! max-w-2xl!">
      <template #header>
        <div>
          <BackButton
            icon="vuesax.linear.arrow-left"
            class="mb-4"
            @click="showUploadModal = false"
          />
          <h2 class="text-2xl font-semibold text-gray-900">Upload File</h2>
        </div>
      </template>

      <div class="py-6">
        <n-upload
          multiple
          directory-dnd
          :max="5"
          :file-list="uploadFileList"
          @update:file-list="handleFileListUpdate"
          action="#"
        >
          <n-upload-dragger>
            <div class="mb-4">
              <MlbIcon name="vuesax.linear.camera" :size="48" />
            </div>
            <n-text style="font-size: 16px" class="text-gray-900"
              >Drag & Drop your files here</n-text
            >
            <n-p depth="3" style="margin: 8px 0 0 0" class="text-gray-500">Maximum file 2MB</n-p>
          </n-upload-dragger>
        </n-upload>

        <div v-if="uploadError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm">{{ uploadError }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <MlbButton
            label="Cancel"
            secondary
            class="rounded-lg! px-8! py-2.5!"
            @click="
              () => {
                showUploadModal = false
                uploadFileList = []
                uploadError = ''
              }
            "
          />
          <MlbButton
            label="Upload"
            primary
            :disabled="uploadFileList.length === 0 || isUploading || !!uploadError"
            :class="[
              'rounded-lg! text-white! px-8! py-2.5!',
              uploadError ? 'bg-red-600! hover:bg-red-700!' : 'bg-primary-700!',
            ]"
            @click="handleUpload"
          />
        </div>
      </template>
    </MlbModal>

    <!-- Upload File Drawer (Mobile) -->
    <n-drawer
      v-if="!isLargeScreen"
      v-model:show="showUploadModal"
      placement="bottom"
      :height="500"
      class="rounded-t-3xl!"
    >
      <n-drawer-content>
        <div class="py-4">
          <BackButton
            icon="vuesax.linear.arrow-left"
            class="mb-4"
            @click="showUploadModal = false"
          />
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Upload File</h2>
          <n-upload
            multiple
            directory-dnd
            :max="5"
            :file-list="uploadFileList"
            @update:file-list="handleFileListUpdate"
            action="#"
          >
            <n-upload-dragger>
              <div class="mb-4">
                <MlbIcon name="vuesax.linear.camera" :size="48" />
              </div>
              <n-text style="font-size: 16px" class="text-gray-900"
                >Drag & Drop your files here</n-text
              >
              <n-p depth="3" style="margin: 8px 0 0 0" class="text-gray-500">Maximum file 2MB</n-p>
            </n-upload-dragger>
          </n-upload>

          <div v-if="uploadError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm">{{ uploadError }}</p>
          </div>

          <div class="flex gap-3 mt-6">
            <MlbButton
              label="Cancel"
              secondary
              block
              class="rounded-lg! py-3!"
              @click="
                () => {
                  showUploadModal = false
                  uploadFileList = []
                  uploadError = ''
                }
              "
            />
            <MlbButton
              label="Upload"
              primary
              block
              :disabled="uploadFileList.length === 0 || isUploading || !!uploadError"
              :class="[
                'rounded-lg! text-white! py-3!',
                uploadError ? 'bg-red-600! hover:bg-red-700!' : 'bg-primary-700!',
              ]"
              @click="handleUpload"
            />
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- Add Title Modal (Desktop) -->
    <MlbModal v-if="isLargeScreen" v-model:show="showTitleModal" class="rounded-3xl! max-w-md!">
      <template #header>
        <h2 class="text-2xl font-semibold text-gray-900">Edit Title</h2>
      </template>

      <div class="py-6">
        <n-form ref="titleFormRef" :model="titleForm" :rules="titleRules">
          <n-form-item path="title" :show-require-mark="false">
            <MlbInput
              v-model="titleForm.title"
              id="title"
              placeholder="Enter title"
              custom-class="border-gray-300 focus:border-primary-500"
            />
          </n-form-item>
        </n-form>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <MlbButton
            label="Cancel"
            secondary
            class="rounded-lg! px-8! py-2.5!"
            @click="
              ;() => {
                showTitleModal = false
                titleForm.title = ''
              }
              titleForm.title = ''
            "
          />
          <MlbButton
            label="Save"
            primary
            class="rounded-lg! bg-primary-700! text-white! px-8! py-2.5!"
            @click="handleSaveTitle"
          />
        </div>
      </template>
    </MlbModal>

    <!-- Add Title Drawer (Mobile) -->
    <n-drawer
      v-if="!isLargeScreen"
      v-model:show="showTitleModal"
      placement="bottom"
      :height="250"
      class="rounded-t-3xl!"
    >
      <n-drawer-content>
        <div class="py-4">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Edit Title</h2>
          <n-form ref="titleFormRef" :model="titleForm" :rules="titleRules">
            <n-form-item path="title" :show-require-mark="false">
              <MlbInput
                v-model="titleForm.title"
                id="title"
                placeholder="Enter title"
                custom-class="border-gray-300 focus:border-primary-500"
              />
            </n-form-item>
          </n-form>
          <div class="flex gap-3 mt-6">
            <MlbButton
              label="Cancel"
              secondary
              block
              class="rounded-lg! py-3!"
              @click="
                () => {
                  titleForm.title = ''
                  showTitleModal = false
                }
              "
            />
            <MlbButton
              label="Save"
              primary
              block
              class="rounded-lg! bg-primary-700! text-white! py-3!"
              @click="handleSaveTitle"
            />
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- Add Description Modal (Desktop) -->
    <MlbModal
      v-if="isLargeScreen"
      v-model:show="showDescriptionModal"
      class="rounded-3xl! max-w-md!"
    >
      <template #header>
        <h2 class="text-2xl font-semibold text-gray-900">Edit Description</h2>
      </template>

      <div class="py-6">
        <n-form ref="descriptionFormRef" :model="descriptionForm">
          <n-form-item path="description" :show-require-mark="false">
            <MlbInput
              v-model="descriptionForm.description"
              id="description"
              type="textarea"
              :rows="4"
              placeholder="Enter description"
              custom-class="border-gray-300 focus:border-primary-500"
            />
          </n-form-item>
        </n-form>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <MlbButton
            label="Cancel"
            secondary
            class="rounded-lg! px-8! py-2.5!"
            @click="
              () => {
                descriptionForm.description = ''
                showDescriptionModal = false
              }
            "
          />
          <MlbButton
            label="Save"
            primary
            class="rounded-lg! bg-primary-700! text-white! px-8! py-2.5!"
            @click="handleSaveDescription"
          />
        </div>
      </template>
    </MlbModal>

    <!-- Add Description Drawer (Mobile) -->
    <n-drawer
      v-if="!isLargeScreen"
      v-model:show="showDescriptionModal"
      placement="bottom"
      :height="350"
      class="rounded-t-3xl!"
    >
      <n-drawer-content>
        <div class="py-4">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Edit Description</h2>
          <n-form ref="descriptionFormRef" :model="descriptionForm">
            <n-form-item path="description" :show-require-mark="false">
              <MlbInput
                v-model="descriptionForm.description"
                id="description"
                type="textarea"
                :rows="4"
                placeholder="Enter description"
                custom-class="border-gray-300 focus:border-primary-500"
              />
            </n-form-item>
          </n-form>
          <div class="flex gap-3 mt-6">
            <MlbButton
              label="Cancel"
              secondary
              block
              class="rounded-lg! py-3!"
              @click="
                () => {
                  showDescriptionModal = false
                  descriptionForm.description = ''
                }
              "
            />
            <MlbButton
              label="Save"
              primary
              block
              class="rounded-lg! bg-primary-700! text-white! py-3!"
              @click="handleSaveDescription"
            />
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- Add Tags Modal (Desktop) -->
    <MlbModal v-if="isLargeScreen" v-model:show="showTagsModal" class="rounded-3xl! max-w-md!">
      <template #header>
        <h2 class="text-2xl font-semibold text-gray-900">Edit Tags</h2>
      </template>

      <div class="py-6">
        <n-form ref="tagsFormRef" :model="tagsForm">
          <n-form-item path="tags" :show-require-mark="false">
            <MlbInput
              v-model="tagsForm.tags"
              id="tags"
              placeholder="Enter tags (comma separated)"
              custom-class="border-gray-300 focus:border-primary-500"
            />
          </n-form-item>
        </n-form>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <MlbButton
            label="Cancel"
            secondary
            class="rounded-lg! px-8! py-2.5!"
            @click="
              () => {
                showTagsModal = false
                tagsForm.tags = ''
              }
            "
          />
          <MlbButton
            label="Save"
            primary
            class="rounded-lg! bg-primary-700! text-white! px-8! py-2.5!"
            @click="handleSaveTags"
          />
        </div>
      </template>
    </MlbModal>

    <!-- Add Tags Drawer (Mobile) -->
    <n-drawer
      v-if="!isLargeScreen"
      v-model:show="showTagsModal"
      placement="bottom"
      :height="250"
      class="rounded-t-3xl!"
    >
      <n-drawer-content>
        <div class="py-4">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Edit Tags</h2>
          <n-form ref="tagsFormRef" :model="tagsForm">
            <n-form-item path="tags" :show-require-mark="false">
              <MlbInput
                v-model="tagsForm.tags"
                id="tags"
                placeholder="Enter tags (comma separated)"
                custom-class="border-gray-300 focus:border-primary-500"
              />
            </n-form-item>
          </n-form>
          <div class="flex gap-3 mt-6">
            <MlbButton
              label="Cancel"
              secondary
              block
              class="rounded-lg! py-3!"
              @click="
                ;() => {
                  showTagsModal = false
                  tagsForm.tags = ''
                }
                tagsForm.tags = ''
              "
            />
            <MlbButton
              label="Save"
              primary
              block
              class="rounded-lg! bg-primary-700! text-white! py-3!"
              @click="handleSaveTags"
            />
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- Set Date Modal (Desktop) -->
    <MlbModal v-if="isLargeScreen" v-model:show="showDateModal" class="rounded-3xl! max-w-md!">
      <template #header>
        <h2 class="text-2xl font-semibold text-gray-900">Edit Date</h2>
      </template>

      <div class="py-6">
        <n-form ref="dateFormRef" :model="dateForm">
          <n-form-item path="date" :show-require-mark="false">
            <n-date-picker
              v-model:value="dateForm.date"
              type="date"
              placeholder="Select date"
              class="w-full"
            />
          </n-form-item>
        </n-form>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <MlbButton
            label="Cancel"
            secondary
            class="rounded-lg! px-8! py-2.5!"
            @click="
              () => {
                showDateModal = false
                dateForm.date = null
              }
            "
          />
          <MlbButton
            label="Save"
            primary
            class="rounded-lg! bg-primary-700! text-white! px-8! py-2.5!"
            @click="handleSaveDate"
          />
        </div>
      </template>
    </MlbModal>

    <!-- Set Date Drawer (Mobile) -->
    <n-drawer
      v-if="!isLargeScreen"
      v-model:show="showDateModal"
      placement="bottom"
      :height="280"
      class="rounded-t-3xl!"
    >
      <n-drawer-content>
        <div class="py-4">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Edit Date</h2>
          <n-form ref="dateFormRef" :model="dateForm">
            <n-form-item path="date" :show-require-mark="false">
              <n-date-picker
                v-model:value="dateForm.date"
                type="date"
                placeholder="Select date"
                class="w-full"
              />
            </n-form-item>
          </n-form>
          <div class="flex gap-3 mt-6">
            <MlbButton
              label="Cancel"
              secondary
              block
              class="rounded-lg! py-3!"
              @click="
                () => {
                  showDateModal = false
                  dateForm.date = null
                }
              "
            />
            <MlbButton
              label="Save"
              primary
              block
              class="rounded-lg! bg-primary-700! text-white! py-3!"
              @click="handleSaveDate"
            />
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- Delete Confirmation Modal (Desktop) -->
    <MlbModal v-if="isLargeScreen" v-model:show="showDeleteModal" class="rounded-3xl! max-w-md!">
      <template #header>
        <h2 class="text-2xl font-semibold text-gray-900">Delete File</h2>
      </template>

      <div class="py-6">
        <p class="text-gray-700">
          Are you sure you want to delete this file? This action cannot be undone.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <MlbButton
            label="Cancel"
            secondary
            class="rounded-lg! px-8! py-2.5!"
            @click="
              () => {
                showDeleteModal = false
                fileToDelete = null
              }
            "
          />
          <MlbButton
            label="Delete"
            class="rounded-lg! bg-red-600! text-white! px-8! py-2.5! hover:bg-red-700!"
            @click="handleDeleteFile"
          />
        </div>
      </template>
    </MlbModal>

    <!-- Delete Confirmation Drawer (Mobile) -->
    <n-drawer
      v-if="!isLargeScreen"
      v-model:show="showDeleteModal"
      placement="bottom"
      :height="250"
      class="rounded-t-3xl!"
    >
      <n-drawer-content>
        <div class="py-4">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Delete File</h2>
          <p class="text-gray-700 mb-6">
            Are you sure you want to delete this file? This action cannot be undone.
          </p>
          <div class="flex gap-3">
            <MlbButton
              label="Cancel"
              secondary
              block
              class="rounded-lg! py-3!"
              @click="
                () => {
                  showDeleteModal = false
                  fileToDelete = null
                }
              "
            />
            <MlbButton
              label="Delete"
              block
              class="rounded-lg! bg-red-600! text-white! py-3! hover:bg-red-700!"
              @click="handleDeleteFile"
            />
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import {
  NForm,
  NFormItem,
  NUpload,
  NUploadDragger,
  NText,
  NP,
  NDatePicker,
  NDrawer,
  NDrawerContent,
  useMessage,
  type FormInst,
  type FormRules,
  type UploadFileInfo,
} from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbInputOtp from '@/components/ui/MlbInputOtp.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import BackButton from '@/components/common/BackButton.vue'

const message = useMessage()
const isLargeScreen = useMediaQuery('(min-width: 768px)')

// State
const isLocked = ref(true) // Vault starts locked
const showPinModal = ref(false)
const showPinConfirmed = ref(false)
const showUploadModal = ref(false)
const showTitleModal = ref(false)
const showDescriptionModal = ref(false)
const showTagsModal = ref(false)
const showDateModal = ref(false)
const showDeleteModal = ref(false)

const pinFormRef = ref<FormInst | null>(null)
const titleFormRef = ref<FormInst | null>(null)
const descriptionFormRef = ref<FormInst | null>(null)
const tagsFormRef = ref<FormInst | null>(null)
const dateFormRef = ref<FormInst | null>(null)

const pinError = ref('')
const uploadError = ref('')
const isUploading = ref(false)
const uploadFileList = ref<UploadFileInfo[]>([])
const fileToDelete = ref<VaultFile | null>(null)

// Forms
const pinForm = reactive({
  pin: null as string[] | null,
})

const titleForm = reactive({
  title: '',
})

const descriptionForm = reactive({
  description: '',
})

const tagsForm = reactive({
  tags: '',
})

const dateForm = reactive({
  date: null as number | null,
})

// Validation Rules
const pinRules: FormRules = {
  pin: [
    { required: true, message: 'PIN is required', trigger: 'blur' },
    { len: 4, message: 'PIN must be 4 digits', trigger: 'blur' },
  ],
}

const titleRules: FormRules = {
  title: [{ required: true, message: 'Title is required', trigger: 'blur' }],
}

// Vault Files Interface
interface VaultFile {
  id: string
  title: string
  type: 'image' | 'audio' | 'document'
  url: string
  thumbnail?: string
  date: string
  description?: string
  tags?: string[]
}

// Sample vault files (replace with API call)
const vaultFiles = ref<VaultFile[]>([
  // {
  //   id: '1',
  //   title: 'Family Photo 2024',
  //   type: 'image',
  //   url: '/path/to/image.jpg',
  //   thumbnail: '/path/to/thumbnail.jpg',
  //   date: '2024-01-15',
  // },
])

// Methods
const handlePinSubmit = () => {
  pinFormRef.value?.validate((errors) => {
    if (errors) {
      pinError.value = 'Invalid PIN'
      return
    }

    const pinString = pinForm.pin?.join('') || ''

    // TODO: Verify PIN with backend
    // For now, accept any 4-digit PIN
    if (pinString.length === 4) {
      pinError.value = ''
      showPinModal.value = false
      showPinConfirmed.value = true
      pinForm.pin = null
    } else {
      pinError.value = 'Invalid PIN. Please try again.'
    }
  })
}

const handleFileListUpdate = (fileList: UploadFileInfo[]) => {
  uploadFileList.value = fileList

  // Check for errors
  const hasPublicFiles = fileList.some(() => {
    // Check if file is publicly shared (mock check)
    return false // Replace with actual check
  })

  if (hasPublicFiles) {
    uploadError.value = 'Publicly shared files are not allowed'
  } else if (fileList.length > 1) {
    uploadError.value = 'You can only upload 1 file at a time'
  } else {
    uploadError.value = ''
  }
}

const handleUpload = async () => {
  if (uploadFileList.value.length === 0) {
    message.warning('Please select a file to upload')
    return
  }

  if (uploadError.value) {
    return
  }

  isUploading.value = true

  try {
    // TODO: Upload file to backend
    // For now, simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const firstFile = uploadFileList.value[0]
    if (!firstFile) {
      message.error('No file selected')
      return
    }

    const newFile: VaultFile = {
      id: Date.now().toString(),
      title: firstFile.name || 'Untitled',
      type: firstFile.type?.startsWith('image/') ? 'image' : 'document',
      url: '#',
      date: new Date().toISOString(),
    }

    vaultFiles.value.push(newFile)
    message.success('File uploaded successfully')

    showUploadModal.value = false
    uploadFileList.value = []
    uploadError.value = ''
  } catch {
    message.error('Failed to upload file')
  } finally {
    isUploading.value = false
  }
}

const openFilePreview = (_file: VaultFile) => {
  // TODO: Open file preview or details modal
  console.log('Opening file:', _file)
}

const openDeleteConfirmation = (file: VaultFile) => {
  fileToDelete.value = file
  showDeleteModal.value = true
}

const handleDeleteFile = () => {
  if (fileToDelete.value) {
    vaultFiles.value = vaultFiles.value.filter((f) => f.id !== fileToDelete.value!.id)
    message.success('File deleted successfully')
    showDeleteModal.value = false
    fileToDelete.value = null
  }
}

const handleSaveTitle = () => {
  titleFormRef.value?.validate((errors) => {
    if (!errors && fileToDelete.value) {
      // TODO: Update file title via API
      const file = vaultFiles.value.find((f) => f.id === fileToDelete.value?.id)
      if (file && fileToDelete.value) {
        file.title = titleForm.title
        message.success('Title saved successfully')
        showTitleModal.value = false
        titleForm.title = ''
        fileToDelete.value = null
      }
    }
  })
}

const handleSaveDescription = () => {
  if (fileToDelete.value) {
    const file = vaultFiles.value.find((f) => f.id === fileToDelete.value?.id)
    if (file && fileToDelete.value) {
      file.description = descriptionForm.description
      message.success('Description saved successfully')
      showDescriptionModal.value = false
      descriptionForm.description = ''
      fileToDelete.value = null
    }
  }
}

const handleSaveTags = () => {
  if (fileToDelete.value) {
    const file = vaultFiles.value.find((f) => f.id === fileToDelete.value?.id)
    if (file && fileToDelete.value) {
      file.tags = tagsForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)
      message.success('Tags saved successfully')
      showTagsModal.value = false
      tagsForm.tags = ''
      fileToDelete.value = null
    }
  }
}

const handleSaveDate = () => {
  if (fileToDelete.value && dateForm.date) {
    const file = vaultFiles.value.find((f) => f.id === fileToDelete.value?.id)
    if (file && fileToDelete.value) {
      file.date = new Date(dateForm.date).toISOString()
      message.success('Date saved successfully')
      showDateModal.value = false
      dateForm.date = null
      fileToDelete.value = null
    }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped></style>
