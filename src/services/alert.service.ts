import { ref, type Ref } from 'vue'
import type { AlertConfig } from '@/types/alert.types'

interface AlertState {
  config: AlertConfig | null
  show: boolean
}

const alertState: Ref<AlertState> = ref({
  config: null,
  show: false,
})

let resolvePromise: ((value: unknown) => void) | null = null
let rejectPromise: ((reason?: unknown) => void) | null = null

/**
 * Shows an alert (toast or modal) with the given configuration
 * Returns a promise that resolves when the user confirms or rejects when cancelled
 */
export function alert(config: AlertConfig): Promise<unknown> {
  return new Promise((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject

    // Set default type if not provided
    const alertConfig: AlertConfig = {
      type: 'modal',
      buttonLayout: config.buttonLayout || 'horizontal',
      cancelFirst: config.cancelFirst || true,
      showConfirmButton: true,
      showCancelButton: config.type === 'confirm',
      closable: config.type !== 'confirm',
      maskClosable: config.type !== 'confirm',
      duration: config.type === 'toast' ? 3000 : 0,
      ...config,
      resolve,
      reject,
    }

    alertState.value = {
      config: alertConfig,
      show: true,
    }
  })
}

/**
 * Convenience method for showing a success alert
 */
export function successAlert(config: Omit<AlertConfig, 'type'>): Promise<unknown> {
  return alert({
    ...config,
    type: 'success',
    iconName: config.iconName || 'vuesax.linear.tick-circle',
    iconColor: config.iconColor || 'success',
  })
}

/**
 * Convenience method for showing an error alert
 */
export function errorAlert(config: Omit<AlertConfig, 'type'>): Promise<unknown> {
  return alert({
    ...config,
    type: 'error',
    iconName: config.iconName || 'vuesax.linear.close-circle',
    iconColor: config.iconColor || 'error',
  })
}

/**
 * Convenience method for showing a warning alert
 */
export function warningAlert(config: Omit<AlertConfig, 'type'>): Promise<unknown> {
  return alert({
    ...config,
    type: 'warning',
    iconName: config.iconName || 'vuesax.linear.info-circle',
    iconColor: config.iconColor || 'warning',
  })
}

/**
 * Convenience method for showing an info alert
 */
export function infoAlert(config: Omit<AlertConfig, 'type'>): Promise<unknown> {
  return alert({
    ...config,
    type: 'info',
    iconName: config.iconName || 'vuesax.linear.info-circle',
    iconColor: config.iconColor || 'info',
  })
}

/**
 * Convenience method for showing a confirmation dialog
 */
export function confirmAlert(config: Omit<AlertConfig, 'type'>): Promise<unknown> {
  return alert({
    ...config,
    type: 'confirm',
    showCancelButton: true,
    closable: config.closable || false,
    maskClosable: false,
    iconName: config.iconName || 'vuesax.linear.question',
    iconColor: config.iconColor || 'primary',
  })
}

/**
 * Convenience method for showing a toast notification
 */
export function toast(config: Omit<AlertConfig, 'type'>): void {
  alert({
    ...config,
    type: 'toast',
    duration: config.duration ?? 3000,
    showCancelButton: false,
  })
}

/**
 * Closes the current alert
 */
export function closeAlert(): void {
  alertState.value.show = false
  if (resolvePromise) {
    resolvePromise(null)
  }
  resolvePromise = null
  rejectPromise = null
}

/**
 * Resolves the alert with a value
 */
export function resolveAlert(value?: unknown): void {
  alertState.value.show = false
  if (resolvePromise) {
    resolvePromise(value ?? alertState.value.config?.resolveValue)
  }
  resolvePromise = null
  rejectPromise = null
}

/**
 * Rejects the alert with a reason
 */
export function rejectAlert(reason?: unknown): void {
  alertState.value.show = false
  if (rejectPromise) {
    rejectPromise(reason ?? alertState.value.config?.rejectValue)
  }
  resolvePromise = null
  rejectPromise = null
}

/**
 * Gets the current alert state (for use in components)
 */
export function useAlertState() {
  return alertState
}

// Export a service object for easier use
export const AlertService = {
  alert,
  success: successAlert,
  error: errorAlert,
  warning: warningAlert,
  info: infoAlert,
  confirm: confirmAlert,
  toast,
  close: closeAlert,
  resolve: resolveAlert,
  reject: rejectAlert,
}
