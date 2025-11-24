import { getCurrentInstance, nextTick, ref, type ComponentInternalInstance } from 'vue'
import type { App as VueApp } from 'vue'
import { useTourStore } from '@/stores/tour'
import { useUpdateTourStageMutation, useSkipTourMutation } from '@/services/general.service'
import { useProfile } from './useProfile'

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
  const vm = ref<Record<string, any>>({})
  const tourStore = useTourStore()
  const { getProfile } = useProfile()
  const { mutate: updateTourStageMutation } = useUpdateTourStageMutation()
  const { mutate: skipTourMutation } = useSkipTourMutation()
  
  const getTours = (): Record<string, Tour> | null => {
    const app = getCurrentInstance()
    vm.value = (app as ComponentInternalInstance).appContext.config.globalProperties
    return vm.value.$tours || null
  }

  const startTour = (name?: string) => {
    const tourKey = name || tourName || 'myTour'

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
    await skipTourMutation()
    await getProfile()
    tour.skip()
  }

  const nextStep = async (lastStep: boolean, tour: Tour) => {
    await updateTourStageMutation({ stage: tour.currentStep + 1 })
    await getProfile()
    if (lastStep) {
      tour.finish()
    } else {
      tour.nextStep()
    }
  }

  return {
    startTour,
    stopTour,
    getTours,
    skipTour,
    nextStep,
  }
}
