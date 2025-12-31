export type TourStages = 'time_capsule' | 'storage' | 'family_tree' | 'memory_vault'

export interface TourStageInterface {
  id: number
  tour_type: TourStages
  tour_label: string
  current_stage: number
  is_skipped: boolean
  skipped_at: string | null
  completed_at: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface TourUpdateTypeInterface {
  tour_type: TourStages
  action: 'increment' | 'skip'
}
