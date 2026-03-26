export interface CreateMemoryValues {
  title: string
  description: string
  family_member_ids: number[]
  event_date: string | null
  files: File[]
  metadata: {
    location: string
  }
}
