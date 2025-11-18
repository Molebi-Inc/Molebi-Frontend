export type AlertType = 'toast' | 'modal' | 'confirm' | 'success' | 'error' | 'info' | 'warning'

export type IconColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | string

export interface AlertInputConfig {
  type?: 'text' | 'password' | 'email' | 'number' | 'textarea'
  name: string
  label?: string
  placeholder?: string
  value?: string
  required?: boolean
  validation?: (value: string) => string | null // Return error message or null
  rows?: number // For textarea
}

export interface CustomButtonClass {
  confirmButton?: string
  cancelButton?: string
  primaryButton?: string
  secondaryButton?: string
}

export interface AlertButtonConfig {
  text: string
  action?: () => void | Promise<void>
  closeOnClick?: boolean // Default true
  loading?: boolean
  disabled?: boolean
}

export interface AlertConfig {
  // Basic properties
  type?: AlertType // Default: 'modal'
  subject?: string // Title/Heading
  message?: string // Main message/description
  html?: string // HTML content (alternative to message)

  // Icon configuration
  iconName?: string
  iconColor?: IconColor
  iconSize?: number
  showIcon?: boolean

  // Image configuration (alternative to icon)
  imageUrl?: string
  imageAlt?: string
  imageClass?: string

  // Button configuration
  confirmButtonText?: string
  cancelButtonText?: string
  showConfirmButton?: boolean // Default: true
  showCancelButton?: boolean // Default: false for toast, true for confirm
  buttonConfig?: {
    confirm?: AlertButtonConfig
    cancel?: AlertButtonConfig
  }

  // Styling
  customClass?: CustomButtonClass
  modalClass?: string
  toastClass?: string

  // Input support (for confirmation modals with input)
  inputs?: AlertInputConfig[]
  inputValues?: Record<string, string> // Initial values

  // Callbacks
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void | Promise<void>
  onClose?: () => void

  // Toast specific
  duration?: number // Toast duration in ms (0 = persistent)
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  // Modal specific
  closable?: boolean // Show close button (default: true)
  maskClosable?: boolean // Close on mask click (default: false for confirm, true for others)
  width?: string | number
  maxWidth?: string | number

  // Promise resolve/reject
  resolve?: (value: unknown) => void
  reject?: (reason?: unknown) => void
  resolveValue?: unknown // Value to resolve with
  rejectValue?: unknown // Value to reject with
}
