export interface HeritageInterface {
  id: number
  title: string
  content: string
}

export interface HeritageDataInterface {
  about: string
  community_name: string
  created_at: string
  economy: string
  geographic_info: string
  history: string
  id: number
  population: string
  state: { id: number; name: string }
  traditional_rulers: string
  updated_at: string
}
