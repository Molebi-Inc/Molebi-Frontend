import type { Component } from 'vue'

export interface TreeSettings {
  is_display_relationship_tiles: boolean
  is_display_full_name: boolean
  is_display_only_direct_connections: boolean
}

export interface TreeSettingsForm {
  label: string
  value: keyof TreeSettings
  checked: boolean
}

type WhoCanViewProfile = 'only_me' | 'family_members' | 'extended_family' | 'public'
type WhoCanEditProfile = 'admin' | 'user'

export interface PrivacySettings {
  who_can_view_profile: WhoCanViewProfile[]
  who_can_edit_profile: WhoCanEditProfile[]
}

export interface NotificationSettings {
  is_birthday_anniversary_reminder: boolean
  is_family_member_added: boolean
  is_photo_added: boolean
  is_tree_updated_and_invite_sent: boolean
  is_enabled_email_notifications: boolean
  is_enabled_push_notifications: boolean
}

export type ViewOptionValue = PrivacySettings['who_can_view_profile'][number]
export type EditOptionValue = PrivacySettings['who_can_edit_profile'][number]

export interface PrivacyOption<T extends string> {
  label: string
  value: T
  checked: boolean
}

export interface HelpInterface {
  id: string
  question: string
  answer: string
}

export interface NotificationOptions {
  key: keyof NotificationSettings
  label: string
  checked: boolean
}

export type SettingsSection =
  | 'profile'
  | 'tree'
  | 'privacy'
  | 'security'
  | 'notification'
  | 'help'
  | 'about'
  | 'delete'

export interface Settings {
  family_tree_settings: TreeSettings
  privacy_settings: PrivacySettings
  notification_settings: NotificationSettings
}

export interface SettingsItem {
  id: SettingsSection
  label: string
  component: Component
  description?: string
  hide?: boolean
  icon?: string
  tag?: 'danger'
}

export interface ChangePasswordValues {
  old_password: string
  password: string
  password_confirmation: string
}

export interface ChangePasswordErrors {
  old_password?: { message: string }[]
  password?: { message: string }[]
  password_confirmation?: { message: string }[]
}

export interface ChangeVaultPinValues {
  old_pin: string
  pin: string
  pin_confirmation: string
}

export interface ChangeVaultPinErrors {
  old_pin?: { message: string }[]
  pin?: { message: string }[]
  pin_confirmation?: { message: string }[]
}

export type SecurityItemId = 'change-password' | 'change-pin' | null

export interface SecurityItem {
  id: SecurityItemId
  label: string
  description: string
  icon: string
  component: Component
}
