import { useShare } from '@vueuse/core'
import { computed } from 'vue'

export interface ShareOptions {
  title?: string
  text?: string
  url?: string
}

/**
 * Composable for sharing functionality
 * Uses Web Share API when available, falls back to copying to clipboard
 */
export function useShareComposable() {
  const { share, isSupported } = useShare()

  const shareLink = async (options: ShareOptions) => {
    if (isSupported.value && options.url) {
      try {
        await share({
          title: options.title || 'Share Link',
          text: options.text || '',
          url: options.url,
        })
        return { success: true, method: 'native' }
      } catch (error) {
        // User cancelled or share failed
        if (error instanceof Error && error.name !== 'AbortError') {
          throw error
        }
        return { success: false, method: 'native', cancelled: true }
      }
    } else {
      // Fallback: Copy to clipboard
      if (options.url) {
        try {
          await navigator.clipboard.writeText(options.url)
          return { success: true, method: 'clipboard' }
        } catch (error) {
          throw new Error('Failed to copy link to clipboard')
        }
      }
      return { success: false, method: 'clipboard' }
    }
  }

  return {
    shareLink,
    isShareSupported: computed(() => isSupported.value),
  }
}