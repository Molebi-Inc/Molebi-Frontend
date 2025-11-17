import { getCurrentInstance } from 'vue'
import type { App as VueApp } from 'vue'

interface Tour {
  start: () => void
  stop: () => void
  nextStep: () => void
  previousStep: () => void
}

export function useTour(tourName?: string) {
  const getTours = (): Record<string, Tour> | null => {
    // Try getCurrentInstance first (works during setup)
    const instance = getCurrentInstance()
    if (instance?.appContext?.config?.globalProperties) {
      return (
        (instance.appContext.config.globalProperties as { $tours?: Record<string, Tour> }).$tours ||
        null
      )
    }

    // Fallback to global app instance (works in event handlers)
    const globalApp = (window as { __VUE_APP__?: VueApp }).__VUE_APP__
    if (globalApp?.config?.globalProperties) {
      return (globalApp.config.globalProperties as { $tours?: Record<string, Tour> }).$tours || null
    }

    return null
  }

  const startTour = (name?: string) => {
    const tours = getTours()
    console.log('tours', tours)
    const tour = tours?.[name || tourName || 'myTour']
    if (tour) {
      console.log('tour', tour)
      tour.start()
    }
  }

  const stopTour = (name?: string) => {
    const tours = getTours()
    const tour = tours?.[name || tourName || 'myTour']
    if (tour) {
      tour.stop()
    }
  }

  return {
    startTour,
    stopTour,
    getTours,
  }
}
