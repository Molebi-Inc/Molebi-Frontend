export type SidebarItem = {
  id: string
  elId?: string
  label: string
  icon: string
  route: { name: string }
  main?: boolean
}

export type TourList = {
  tour_name: string
  tour_steps: TourStep[]
}

export type TourStep = {
  target: string
  header: { title: string }
  content: string
}
