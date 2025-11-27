<template>
  <!-- Modal/Dialog Alert -->
  <MlbModal
    v-if="config && config.type !== 'toast' && show"
    v-model:show="localShow"
    :class="[config.modalClass, 'rounded-3xl!']"
    :style="{
      width: config.width || '90%',
      maxWidth: config.maxWidth || '600px',
    }"
  >
    <template #header>
      <div
        v-if="config.closable !== false"
        :class="[
          'flex mb-4',
          config.closablePosition === 'right' ? 'justify-end' : 'justify-start',
        ]"
      >
        <button
          @click="handleClose"
          class="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <MlbIcon name="vuesax.linear.close-circle" :size="24" />
        </button>
      </div>
    </template>

    <div class="py-4">
      <!-- Icon or Image -->
      <div
        v-if="config.showIcon !== false && (config.iconName || config.imageUrl)"
        :class="['flex justify-center mb-4']"
      >
        <div :class="[config.iconWrapperClass]">
          <!-- Icon -->
          <MlbIcon
            v-if="config.iconName && !config.imageUrl"
            :name="config.iconName"
            :color="getIconColor(config.iconColor)"
            :size="config.iconSize || 64"
          />
          <!-- Image -->
          <img
            v-else-if="config.imageUrl"
            :src="getImageUrl(config.imageUrl)"
            :alt="config.imageAlt || config.subject || 'Alert image'"
            :class="['max-w-full h-auto', config.imageClass || 'w-16 h-16 object-contain']"
            :style="{
              width: config.iconSize ? `${config.iconSize}px` : undefined,
              height: config.iconSize ? `${config.iconSize}px` : undefined,
            }"
          />
        </div>
      </div>

      <!-- Subject/Title -->
      <h2 v-if="config.subject" class="text-2xl font-semibold text-gray-900 text-center mb-4">
        <span v-html="config.subject"></span>
      </h2>

      <!-- Message -->
      <div v-if="config.message" class="text-gray-700 text-center mb-6">
        <span v-html="config.message"></span>
      </div>

      <!-- HTML Content -->
      <div v-if="config.html" class="text-gray-700 mb-6">
        <component v-if="typeof config.html !== 'string'" :is="config.html" />
        <span v-else v-html="config.html"></span>
      </div>

      <!-- Input Fields -->
      <div v-if="config.inputs && config.inputs.length > 0" class="space-y-4 mb-6">
        <n-form ref="formRef" :model="inputValues" :rules="inputRules">
          <n-form-item
            v-for="input in config.inputs"
            :key="input.name"
            :label="input.label"
            :path="input.name"
            :show-require-mark="input.required"
          >
            <MlbInput
              v-if="input.type !== 'textarea' && input.type !== 'number'"
              v-model="inputValues[input.name]"
              :id="input.name"
              :name="input.name"
              :type="input.type === 'email' ? 'text' : input.type || 'text'"
              :placeholder="input.placeholder"
              custom-class="border-gray-300 focus:border-primary-500"
            />
            <n-input-number
              v-else-if="input.type === 'number'"
              :value="getNumberValue(input.name)"
              @update:value="(val) => setNumberValue(input.name, val)"
              :id="input.name"
              :name="input.name"
              :placeholder="input.placeholder"
              class="w-full"
            />
            <MlbInput
              v-else
              v-model="inputValues[input.name]"
              :id="input.name"
              :name="input.name"
              type="textarea"
              :rows="input.rows || 4"
              :placeholder="input.placeholder"
              custom-class="border-gray-300 focus:border-primary-500"
            />
          </n-form-item>
        </n-form>
      </div>
    </div>

    <template #footer>
      <div
        :class="[
          'flex',
          { 'flex-col gap-3': config.buttonLayout === 'vertical' && config.cancelFirst },
          { 'flex-col-reverse gap-3': config.buttonLayout === 'vertical' && !config.cancelFirst },
          { 'justify-evenly gap-2': config.buttonLayout === 'horizontal' && config.cancelFirst },
          { 'flex-row-reverse gap-2': config.buttonLayout === 'horizontal' && !config.cancelFirst },
        ]"
      >
        <!-- Cancel Button -->
        <MlbButton
          v-if="!config.showCancelButton && config.cancelButtonText"
          :label="config.cancelButtonText || 'Cancel'"
          secondary
          :loading="config.buttonConfig?.cancel?.loading"
          :disabled="config.buttonConfig?.cancel?.disabled"
          :class="[
            'rounded-lg! px-8! py-2.5!',
            config.customClass?.cancelButton || config.customClass?.secondaryButton,
          ]"
          @click="handleCancel"
        />

        <!-- Confirm Button -->
        <MlbButton
          v-if="config.showConfirmButton !== false && config.confirmButtonText"
          :label="config.confirmButtonText || 'Confirm'"
          :primary="config.buttonConfig?.confirm?.primary || false"
          :loading="config.buttonConfig?.confirm?.loading"
          :disabled="config.buttonConfig?.confirm?.disabled"
          :class="['rounded-lg! px-8! py-2.5!', getConfirmButtonClass()]"
          :style="{ 'text-danger-500': getConfirmButtonClass().includes('bg-red') }"
          @click="handleConfirm"
        />
      </div>
    </template>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NForm, NFormItem, NInputNumber, useNotification } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useAlertState, closeAlert, resolveAlert, rejectAlert } from '@/services/alert.service'
import MlbModal from '@/components/ui/MlbModal.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'

// Preload all images from assets/images for dynamic access
const imageModules = import.meta.glob(
  [
    '/src/assets/images/*.png',
    '/src/assets/images/*.jpg',
    '/src/assets/images/*.jpeg',
    '/src/assets/images/*.svg',
  ],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

const alertState = useAlertState()
const notification = useNotification()

const formRef = ref<FormInst | null>(null)
const inputValues = ref<Record<string, string>>({})

// Generate form rules from input configs
const inputRules = computed((): FormRules => {
  if (!config.value?.inputs) return {}

  const rules: FormRules = {}
  config.value.inputs.forEach((input) => {
    const ruleArray: Array<{
      required?: boolean
      message?: string
      trigger?: string[]
      validator?: (rule: unknown, value: string) => boolean | Error
    }> = []

    if (input.required) {
      ruleArray.push({
        required: true,
        message: `${input.label || input.name} is required`,
        trigger: ['input', 'blur'],
      })
    }

    if (input.validation) {
      ruleArray.push({
        validator: (_rule: unknown, value: string) => {
          const error = input.validation!(value)
          if (error) {
            return new Error(error)
          }
          return true
        },
        trigger: ['input', 'blur'],
      })
    }

    if (ruleArray.length > 0) {
      rules[input.name] = ruleArray
    }
  })
  return rules
})

const config = computed(() => alertState.value.config)
const show = computed(() => alertState.value.show)

const localShow = computed({
  get: () => show.value,
  set: (value: boolean) => {
    if (!value) {
      handleClose()
    }
  },
})

// Watch for toast notifications
watch(
  () => [config.value?.type, show.value],
  ([type, isShow]) => {
    if (type === 'toast' && isShow && config.value) {
      showToast()
    }
  },
  { immediate: true },
)

// Watch for input value changes
watch(
  () => config.value?.inputValues,
  (values) => {
    if (values) {
      inputValues.value = { ...values }
    } else if (config.value?.inputs) {
      // Initialize with empty values
      inputValues.value = config.value.inputs.reduce(
        (acc, input) => {
          acc[input.name] = input.value || ''
          return acc
        },
        {} as Record<string, string>,
      )
    }
  },
  { immediate: true },
)

function showToast() {
  if (!config.value) return

  const toastType =
    config.value.type === 'toast'
      ? config.value.iconColor === 'success'
        ? 'success'
        : config.value.iconColor === 'error'
          ? 'error'
          : config.value.iconColor === 'warning'
            ? 'warning'
            : 'info'
      : 'info'

  const duration = config.value.duration ?? 3000

  const notificationConfig: {
    title: string
    content: string
    duration?: number
    placement?: string
    onClose: () => void
  } = {
    title: config.value.subject || '',
    content: config.value.message || '',
    duration: duration > 0 ? duration : undefined,
    ...(config.value.position && { placement: config.value.position }),
    onClose: () => {
      closeAlert()
    },
  }

  // Show notification based on type
  if (toastType === 'success') {
    notification.success(notificationConfig)
  } else if (toastType === 'error') {
    notification.error(notificationConfig)
  } else if (toastType === 'warning') {
    notification.warning(notificationConfig)
  } else {
    notification.info(notificationConfig)
  }

  if (duration > 0) {
    setTimeout(() => {
      closeAlert()
    }, duration)
  } else {
    // For persistent toasts, resolve immediately but keep showing
    resolveAlert()
  }
}

function getIconColor(color?: string): string {
  if (!color) return 'currentColor'

  const colorMap: Record<string, string> = {
    primary: '#02BF83',
    success: '#02BF5E',
    error: '#EC1919',
    warning: '#E9A506',
    info: '#1870D8',
  }

  return colorMap[color] || color
}

function getImageUrl(imagePath: string): string {
  // If it's already a full URL or starts with /, return as is
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('/')
  ) {
    return imagePath
  }

  // Construct the full path to match the glob pattern
  const fullPath = `/src/assets/${imagePath}`

  // Look up the image in the preloaded modules
  const imageUrl = (imageModules[fullPath] as string) || null

  if (imageUrl) {
    return imageUrl
  }

  // Fallback: return the original path (might work in some cases)
  return fullPath
}

function getConfirmButtonClass(): string {
  const config = alertState.value.config
  if (!config) return 'rounded-lg! px-8! py-2.5!'

  // Type-based button classes
  const typeClasses: Record<string, string> = {
    success: 'bg-green-600! hover:bg-green-700! text-white!',
    error: 'bg-red-600! hover:bg-red-700! text-white!',
    warning: 'bg-yellow-600! hover:bg-yellow-700! text-white!',
    info: 'bg-blue-600! hover:bg-blue-700! text-white!',
  }

  const typeClass =
    typeClasses[config.type || ''] || 'bg-primary-700! text-white hover:bg-primary-800!'

  return [
    'rounded-lg! px-8! py-2.5!',
    config.customClass?.confirmButton || config.customClass?.primaryButton || typeClass,
  ].join(' ')
}

async function handleConfirm() {
  const config = alertState.value.config
  if (!config) return

  // Validate inputs if present
  if (config.inputs && config.inputs.length > 0 && formRef.value) {
    try {
      await formRef.value.validate()
    } catch {
      // Validation failed
      return
    }

    // Run custom validations
    for (const input of config.inputs) {
      const value = inputValues.value[input.name] || ''
      if (input.validation) {
        const error = input.validation(value)
        if (error) {
          // Show error and return
          return
        }
      }
    }
  }

  // Execute button action if provided
  if (config.buttonConfig?.confirm?.action) {
    const action = config.buttonConfig.confirm.action
    const result = action()
    if (result instanceof Promise) {
      config.buttonConfig.confirm.loading = true
      try {
        await result
      } catch (error) {
        config.buttonConfig.confirm.loading = false
        throw error
      }
      config.buttonConfig.confirm.loading = false
    }
  }

  // Execute onConfirm callback
  if (config.onConfirm) {
    const result = config.onConfirm()
    if (result instanceof Promise) {
      await result
    }
  }

  // Close if configured to do so
  if (config.buttonConfig?.confirm?.closeOnClick !== false) {
    resolveAlert(inputValues.value)
  }
}

async function handleCancel() {
  const config = alertState.value.config
  if (!config) return

  // Execute button action if provided
  if (config.buttonConfig?.cancel?.action) {
    const action = config.buttonConfig.cancel.action
    const result = action()
    if (result instanceof Promise) {
      config.buttonConfig.cancel.loading = true
      try {
        await result
      } catch (error) {
        config.buttonConfig.cancel.loading = false
        throw error
      }
      config.buttonConfig.cancel.loading = false
    }
  }

  // Execute onCancel callback
  if (config.onCancel) {
    const result = config.onCancel()
    if (result instanceof Promise) {
      await result
    }
  }

  // Close if configured to do so
  if (config.buttonConfig?.cancel?.closeOnClick !== false) {
    rejectAlert()
  }
}

function getNumberValue(name: string): number {
  const value = inputValues.value[name]
  return parseFloat(value || '0') || 0
}

function setNumberValue(name: string, value: number | null): void {
  inputValues.value[name] = String(value || 0)
}

function handleClose() {
  const config = alertState.value.config
  if (config?.onClose) {
    config.onClose()
  }
  closeAlert()
}
</script>

<style scoped></style>
