export interface SignupFormValues {
  email: string
  phone: string
  code: string
  password: string
  password_confirmation: string
}

export interface SignupFormErrors {
  email?: { message: string }[]
  password?: { message: string }[]
  password_confirmation?: { message: string }[]
}

export interface PersonalInformationFormValues {
  first_name: string
  middle_name: string
  family_name: string
}

export interface PersonalInformationFormErrors {
  first_name?: { message: string }[]
  middle_name?: { message: string }[]
  family_name?: { message: string }[]
}

export interface FamilyInfoFormValues {
  state_of_origin: string
  family_name: string
}

export interface FamilyInfoFormErrors {
  state_of_origin?: { message: string }[]
  family_name?: { message: string }[]
}

export interface FamilyMemberFormValues {
  relationship: string
  first_name: string
  last_name: string
}

export interface FamilyMemberFormErrors {
  relationship?: { message: string }[]
  first_name?: { message: string }[]
  last_name?: { message: string }[]
}

export interface SigninFormValues {
  email: string
  password: string
}

export interface SigninFormErrors {
  email?: { message: string }[]
  password?: { message: string }[]
}
