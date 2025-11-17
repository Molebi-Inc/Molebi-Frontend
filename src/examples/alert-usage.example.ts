/**
 * Alert Service Usage Examples
 *
 * This file demonstrates various ways to use the AlertService
 */

import { AlertService } from '@/services/alert.service'

// ============================================================================
// Example 1: Basic Alert (as shown in your request)
// ============================================================================
export function example1() {
  const AlertConfig = {
    subject: 'Contact us',
    message: 'Mail: olumideabudu@seamlesshr.com',
    iconName: 'vuesax.linear.contact-mail',
    iconColor: 'primary',
    confirmButtonText: 'Close',
    customClass: {
      confirmButton: 'btn btn-outline-primary px-5',
    },
  }

  AlertService.alert(AlertConfig)
}

// ============================================================================
// Example 2: Confirmation Modal with Promise (.then())
// ============================================================================
export async function example2() {
  try {
    const result = await AlertService.confirm({
      subject: 'Delete File',
      message: 'Are you sure you want to delete this file? This action cannot be undone.',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      iconName: 'vuesax.linear.trash',
      iconColor: 'error',
    })

    // This runs when user clicks "Delete"
    console.log('User confirmed deletion')
    // Proceed with deletion...
  } catch (error) {
    // This runs when user clicks "Cancel" or closes the modal
    console.log('User cancelled deletion')
  }
}

// ============================================================================
// Example 3: Success Alert After Action
// ============================================================================
export async function example3() {
  // Simulate an action
  await someAsyncAction()

  // Show success alert
  await AlertService.success({
    subject: 'Success!',
    message: 'Your file has been uploaded successfully.',
    confirmButtonText: 'OK',
    iconName: 'vuesax.linear.tick-circle',
    iconColor: 'success',
  })
}

// ============================================================================
// Example 4: Error Alert
// ============================================================================
export async function example4() {
  try {
    await someAsyncAction()
  } catch (error) {
    AlertService.error({
      subject: 'Error',
      message: 'Something went wrong. Please try again.',
      confirmButtonText: 'OK',
      iconColor: 'error',
    })
  }
}

// ============================================================================
// Example 5: Confirmation with Input
// ============================================================================
export async function example5() {
  try {
    const result = await AlertService.confirm({
      subject: 'Enter PIN',
      message: 'Please enter your PIN to continue:',
      inputs: [
        {
          name: 'pin',
          label: 'PIN',
          type: 'password',
          placeholder: 'Enter 4-digit PIN',
          required: true,
          validation: (value) => {
            if (value.length !== 4) {
              return 'PIN must be 4 digits'
            }
            return null
          },
        },
      ],
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    })

    // result will contain the input values: { pin: "1234" }
    const pin = (result as Record<string, string>).pin
    console.log('User entered PIN:', pin)
  } catch (error) {
    console.log('User cancelled')
  }
}

// ============================================================================
// Example 6: Toast Notification
// ============================================================================
export function example6() {
  AlertService.toast({
    subject: 'Notification',
    message: 'File uploaded successfully',
    iconColor: 'success',
    duration: 3000, // 3 seconds
    position: 'top-right',
  })
}

// ============================================================================
// Example 7: Custom Button Actions
// ============================================================================
export async function example7() {
  try {
    await AlertService.alert({
      subject: 'Save Changes?',
      message: 'You have unsaved changes. What would you like to do?',
      confirmButtonText: 'Save',
      cancelButtonText: 'Discard',
      buttonConfig: {
        confirm: {
          text: 'Save',
          action: async () => {
            // Custom action when Save is clicked
            await saveChanges()
            console.log('Changes saved')
          },
          closeOnClick: true,
        },
        cancel: {
          text: 'Discard',
          action: () => {
            // Custom action when Discard is clicked
            console.log('Changes discarded')
          },
          closeOnClick: true,
        },
      },
    })
  } catch (error) {
    console.log('User cancelled')
  }
}

// ============================================================================
// Example 8: Multiple Inputs
// ============================================================================
export async function example8() {
  try {
    const result = await AlertService.confirm({
      subject: 'Create Account',
      message: 'Please provide the following information:',
      inputs: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'Enter email',
          required: true,
          validation: (value) => {
            if (!value.includes('@')) {
              return 'Invalid email format'
            }
            return null
          },
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Enter password',
          required: true,
          validation: (value) => {
            if (value.length < 8) {
              return 'Password must be at least 8 characters'
            }
            return null
          },
        },
        {
          name: 'notes',
          label: 'Notes',
          type: 'textarea',
          placeholder: 'Additional notes (optional)',
          rows: 4,
        },
      ],
      confirmButtonText: 'Create',
      cancelButtonText: 'Cancel',
    })

    const formData = result as Record<string, string>
    console.log('Form data:', formData)
  } catch (error) {
    console.log('User cancelled')
  }
}

// ============================================================================
// Example 9: Loading State
// ============================================================================
export async function example9() {
  const config = {
    subject: 'Processing',
    message: 'Please wait while we process your request...',
    confirmButtonText: 'Processing...',
    buttonConfig: {
      confirm: {
        text: 'Process',
        loading: false,
        action: async () => {
          // Simulate async operation
          config.buttonConfig!.confirm!.loading = true
          await new Promise((resolve) => setTimeout(resolve, 2000))
          config.buttonConfig!.confirm!.loading = false
        },
      },
    },
  }

  await AlertService.alert(config)
}

// ============================================================================
// Example 10: Using .then() and .catch()
// ============================================================================
export function example10() {
  AlertService.confirm({
    subject: 'Delete Item',
    message: 'Are you sure?',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  })
    .then(() => {
      // User clicked "Delete"
      console.log('Item deleted')
      deleteItem()
    })
    .catch(() => {
      // User clicked "Cancel" or closed modal
      console.log('Deletion cancelled')
    })
}

// Helper functions (mock implementations)
function someAsyncAction(): Promise<void> {
  return Promise.resolve()
}

function saveChanges(): Promise<void> {
  return Promise.resolve()
}

function deleteItem(): void {
  console.log('Item deleted')
}
