export interface Reminder {
  id: number
  title: string
  date: string
}

export interface ReminderStoreInterface {
  reminders: Reminder[]
  loading: boolean
  error: string | null
}
