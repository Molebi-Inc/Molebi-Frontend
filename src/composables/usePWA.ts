import { ref, onMounted, onUnmounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

export interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  // Service worker update state
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    immediate: true,
  })

  // Installation state
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const installPrompt = ref<PWAInstallPrompt | null>(null)

  // Online/offline state
  const isOnline = ref(navigator.onLine)

  // Check if app is already installed
  const checkIfInstalled = () => {
    // Check if running in standalone mode (PWA installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone =
      'standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    isInstalled.value = isStandalone || isIOSStandalone
  }

  // Handle beforeinstallprompt event
  const handleBeforeInstallPrompt = (e: Event) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    installPrompt.value = e as PWAInstallPrompt
    isInstallable.value = true
  }

  // Handle app installed event
  const handleAppInstalled = () => {
    isInstallable.value = false
    isInstalled.value = true
    installPrompt.value = null
  }

  // Handle online/offline events
  const handleOnline = () => {
    isOnline.value = true
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  // Trigger PWA installation
  const install = async (): Promise<boolean> => {
    if (!installPrompt.value) {
      return false
    }

    try {
      await installPrompt.value.prompt()
      const choiceResult = await installPrompt.value.userChoice

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt')
        return true
      } else {
        console.log('[PWA] User dismissed the install prompt')
        return false
      }
    } catch (error) {
      console.error('[PWA] Error during installation:', error)
      return false
    }
  }

  // Update service worker
  const update = async (reloadPage = true) => {
    try {
      await updateServiceWorker(reloadPage)
    } catch (error) {
      console.error('[PWA] Error updating service worker:', error)
    }
  }

  // Setup event listeners
  onMounted(() => {
    checkIfInstalled()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  // Cleanup event listeners
  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    // State
    needRefresh,
    offlineReady,
    isInstallable,
    isInstalled,
    isOnline,

    // Methods
    install,
    update,
  }
}
