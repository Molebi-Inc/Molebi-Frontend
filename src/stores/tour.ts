import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TourList } from '@/types/layout.types'
import { useMediaQuery } from '@vueuse/core'

export const useTourStore = defineStore('tour', () => {
  const isLargeScreen = useMediaQuery('(min-width: 768px)')
  const route = useRoute()
  const tourList: Record<string, TourList> = {
    dashboard: {
      tour_name: 'dashboard',
      tour_steps: [
        {
          target: '#home-tour-step-1',
          header: {
            title: 'This is your family’s central hub.',
          },
          content:
            '<ul style="list-style: disc; text-align: start;"><li>Add family announcements</li><li>Create traditions to celebrate</li><li>View reminders for birthdays or family events</li></ul>',
        },
        {
          target: '#home-tour-step-2',
          header: {
            title: '📢 Family Announcements',
          },
          content:
            'This is where important updates or news appear from family reunions to baby arrivals.<br /><br />Stay connected to what’s happening in your family.',
        },
        {
          target: '#home-tour-step-3',
          header: {
            title: '🌿 Family Traditions',
          },
          content:
            'Here you’ll find all the traditions that bring your family together  old or new.<br /><br />Keep your heritage alive, one memory at a time.',
        },
        // {
        //   target: '#home-tour-step-4',
        //   header: {
        //     title: '⏰ Reminders',
        //   },
        //   content:
        //     'Never miss a birthday, anniversary, or special date again.Your reminders show up here automatically once you add events to your tree or traditions.',
        // },
        {
          target: '#home-tour-step-4',
          header: {
            title: '➕ Add a New Announcement',
          },
          content:
            'Got big news to share? Click here to post a new family announcement, visible to everyone you add to the announcement.',
        },
        {
          target: '#home-tour-step-5',
          header: {
            title: '🕊️ Start a New Tradition',
          },
          content:
            'Create new rituals and moments your family can look forward to from weekly dinners to yearly trips.',
        },
      ],
    },
    'dashboard_mobile': {
      tour_name: 'dashboard_mobile',
      tour_steps: [
        {
          target: '#home-tour-step-1',
          header: {
            title: 'This is your family’s central hub.',
          },
          content:
            '<ul style="list-style: disc; text-align: start;"><li>Add family announcements</li><li>Create traditions to celebrate</li><li>View reminders for birthdays or family events</li></ul>',
        },
        {
          target: '#home-tour-step-2',
          header: {
            title: '📢 Family Announcements',
          },
          content:
            'This is where important updates or news appear from family reunions to baby arrivals.<br /><br />Stay connected to what’s happening in your family.',
        },
        {
          target: '#home-tour-step-3',
          header: {
            title: '🌿 Family Traditions',
          },
          content:
            'Here you’ll find all the traditions that bring your family together  old or new.<br /><br />Keep your heritage alive, one memory at a time.',
        },
      ],
    },
    'time_capsule': {
      tour_name: 'time_capsule',
      tour_steps: [
        {
          target: '#time-capsules-tour-step-1',
          header: {
            title: '🕰️ Your Family Time Machine',
          },
          content:
            'Write letters, record moments, or save secrets that unlock on a future date. Perfect for birthdays, anniversaries, or future generations to discover.',
        },
        {
          target: '#time-capsules-tour-step-2',
          header: {
            title: '⏳ Create a message for the future.',
          },
          content:
            'Time Capsules let you store notes, photos, or audio to be revealed on a chosen date for your loved ones or yourself.',
        },
      ],
    },
    vault: {
      tour_name: 'vault',
      tour_steps: [
        {
          target: '#vault-tour-step-1',
          header: {
            title: '🔒 Your Private Vault',
          },
          content:
            'Store your most sensitive files here locked with your PIN.Only you can access them, but you can grant permissions if needed. <br/> Your default pin is 0000. You can reset your Vault PIN from settings.',
        },
      ],
    },
    storage: {
      tour_name: 'storage',
      tour_steps: [
        {
          target: '#storage-tour-step-1',
          header: {
            title: '📸 Your Family Library',
          },
          content:
            'Here’s where all your <em>photos, videos, and voice notes</em> live.Organize them into folders and relive special memories anytime.',
        },
        {
          target: '#storage-tour-step-2',
          header: {
            title: '📁 Keep memories safe here.',
          },
          content:
            'Create folders for photos, voice notes, or documents organize your family’s history your way.',
        },
      ],
    },
  }

  const currentTourKey = computed<string | undefined>(() => {
    const matchedRoute = [...route.matched]
      .reverse()
      .find((record) =>
        !isLargeScreen.value && record.meta?.mobileTour
          ? record.meta?.mobileTour
          : record.meta?.tour,
      )
    const tourValue =
      !isLargeScreen.value && matchedRoute?.meta?.mobileTour
        ? matchedRoute.meta?.mobileTour
        : matchedRoute?.meta?.tour
    return typeof tourValue === 'string' ? tourValue : undefined
  })

  const getTourSteps = computed<TourList | undefined>(() => {
    if (!currentTourKey.value) return undefined
    return tourList[currentTourKey.value as keyof typeof tourList]
  })

  return { getTourSteps }
})
