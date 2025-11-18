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
  middle_name: string | null
  nickname: string | null
  family_name: string
  dob: string | null
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

export interface VerifyEmailValues {
  otp_code: string
}

export interface VerifyEmailErrors {
  email?: { message: string }[]
  otp?: { message: string }[]
}

export interface ResendOtpParams {
  email: string
}

export interface SigninUser {
  id: number
  first_name: string | null
  middle_name: string | null
  family_name: string | null
  nickname: string | null
  dob: string | null
  email: string
  phone: string
  tour_stage: number
  is_tour_skipped: boolean
  email_verified_at: string
  avatar: string | null
  profile_picture: string | null
  community_name: string | null
  num_of_children: number | null
  mother_family_name: string | null
  created_at: string
}

export interface SigninResponseData {
  user: SigninUser
  token: string
  token_type: string
  abilities: string[]
  email_verified: boolean
}

export interface VerifyEmailResponseData {
  abilities: string[]
  token: string
}
