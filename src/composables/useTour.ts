import { useProfile } from './useProfile'
import { computed, nextTick, type App as VueApp } from 'vue'
import { useUpdateTourStageMutation, useSkipTourMutation } from '@/services/general.service'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import type { TourStages } from '@/types/tour.types'
import { useGeneralStore } from '@/stores/general.store'
import { useTourStore } from '@/stores/tour'

interface Tour {
  start: () => void
  stop: () => void
  nextStep: () => void
  previousStep: () => void
  skip: () => void
  finish: () => void
  currentStep: number
}

export function useTour(tourName?: string) {
  const { getProfile } = useProfile()
  const generalStore = useGeneralStore()
  const tourStore = useTourStore()
  const { mutate: updateTourStageMutation } = useUpdateTourStageMutation()
  const { mutate: skipTourMutation } = useSkipTourMutation()

  const $route = useRoute()
  const isLargeScreen = useMediaQuery('(min-width: 768px)')
  const getTours = (): Record<string, Tour> | null => {
    // Access the globally stored app instance from main.ts
    const app = (window as { __VUE_APP__?: VueApp }).__VUE_APP__
    if (!app || !app.config) {
      return null
    }
    const globalProperties = app.config.globalProperties
    const tours = (globalProperties as unknown as { $tours?: Record<string, Tour> }).$tours
    return tours || null
  }

  const startTour = (name?: string) => {
    // Prefer explicit name, then composable default, then route meta, then fallback
    const routeTourKey =
      ($route.meta.tour as string | undefined) ||
      ($route.meta.mobileTour as string | undefined)?.replace('-mobile', '')
    const tourKey = name || tourName || routeTourKey || 'myTour'

    // Use nextTick to ensure DOM is ready and tour is registered
    nextTick(() => {
      const tours = getTours()
      const tour = tours?.[tourKey]
      if (tour) {
        tour.start()
      }
    })
  }

  const stopTour = (name?: string) => {
    const tours = getTours()
    const tour = tours?.[name || tourName || 'myTour']
    if (tour) {
      tour.stop()
    }
  }

  const skipTour = async (tour: Tour) => {
    await updateTourStageMutation({
      tour_type: isLargeScreen
        ? ($route.meta.tour as TourStages)
        : (($route.meta.mobileTour as string).replace('-mobile', '') as TourStages),
      action: 'skip',
    })
    await getProfile()
    tour.skip()
  }

  const nextStep = async (lastStep: boolean, tour: Tour) => {
    await updateTourStageMutation({
      tour_type: isLargeScreen
        ? ($route.meta.tour as TourStages)
        : (($route.meta.mobileTour as string).replace('-mobile', '') as TourStages),
      action: 'increment',
    })
    await getProfile()
    if (lastStep) {
      tour.finish()
    } else {
      tour.nextStep()
    }
  }

  const tourIsComplete = computed<boolean>(() => {
    const tourType = isLargeScreen
      ? ($route.meta.tour as TourStages)
      : ($route.meta.mobileTour as string)
    if (!tourType) {
      return true
    }
    const tourStage = generalStore.tourStages.find(
      (stage) => stage.tour_type === (tourType as TourStages),
    )
    if (!tourStage) {
      return false
    }

    if (tourStage.is_skipped) {
      return true
    }

    const routeTours = tourStore.getTourSteps?.tour_steps
    if (!routeTours?.length) {
      return true
    }

    if (routeTours.length > tourStage.current_stage) {
      return false
    }

    return true
  })

  return {
    startTour,
    stopTour,
    getTours,
    skipTour,
    nextStep,
    tourIsComplete,
  }
}
