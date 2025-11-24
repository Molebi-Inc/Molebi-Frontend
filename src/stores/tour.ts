import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TourList } from '@/types/layout.types'

export const useTourStore = defineStore('tour', () => {
  const route = useRoute()
  const tourList: Record<string, TourList> = {
    home: {
      tour_name: 'home',
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
        {
          target: '#home-tour-step-4',
          header: {
            title: '⏰ Reminders',
          },
          content:
            'Never miss a birthday, anniversary, or special date again.Your reminders show up here automatically once you add events to your tree or traditions.',
        },
        {
          target: '#home-tour-step-5',
          header: {
            title: '➕ Add a New Announcement',
          },
          content:
            'Got big news to share? Click here to post a new family announcement, visible to everyone you add to the announcement.',
        },
        {
          target: '#home-tour-step-6',
          header: {
            title: '🕊️ Start a New Tradition',
          },
          content:
            'Create new rituals and moments your family can look forward to from weekly dinners to yearly trips.',
        },
      ],
    },
  }

  const currentTourKey = computed<string | undefined>(() => {
    const matchedRoute = [...route.matched].reverse().find((record) => record.meta?.tour)
    return matchedRoute?.meta?.tour as string | undefined
  })

  const getTourSteps = computed<TourList | undefined>(() => {
    if (!currentTourKey.value) return undefined
    return tourList[currentTourKey.value as keyof typeof tourList]
  })

  return { getTourSteps }
})
