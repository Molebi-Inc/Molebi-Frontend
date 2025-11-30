import type { SigninUser } from './authentication.types'
import type { Settings } from './settings.types'

export interface ProfileState {
  user: SigninUser | null
  settings: Settings | null
}

export interface ProfileFormValues {
  avatar?: File | null
  first_name: string
  family_name: string
  email: string
  code: string
  phone: string
}

export interface ProfileFormErrors {
  first_name?: { message: string }[]
  family_name?: { message: string }[]
  email?: { message: string }[]
  code?: { message: string }[]
  phone?: { message: string }[]
}

export interface FamilyInfoFormValues {
  state_id: number | null
  community_name: string
  num_of_children: string
  mother_family_name: string
}
