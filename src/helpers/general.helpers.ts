import { countryOptions } from '@/constants/options.constants'

export const maskEmail = (email: string) => {
  if (!email) return ''
  const [username, domain] = email.split('@')
  if (!username || !domain) return email
  return `${username.slice(0, 2)}*****${username.slice(-2)}@${domain}`
}

export const extractCountryCode = (phoneNumber: string): { code: string; phone: string } => {
  if (!phoneNumber) {
    return { code: '', phone: '' }
  }

  const sortedCountryCodes = [...countryOptions]
    .map((option) => option.value as string)
    .sort((a, b) => b.length - a.length)

  // Try to find a matching country code
  for (const countryCode of sortedCountryCodes) {
    if (phoneNumber.startsWith(countryCode)) {
      return {
        code: countryCode,
        phone: phoneNumber.slice(countryCode.length),
      }
    }
  }

  // If no match found, return empty code and full phone number
  return { code: '', phone: phoneNumber }
}

// Convert time from "1 am" format to "H:i" format (e.g., "01:00", "14:00")
export const convertTimeToHIFormat = (timeValue: string | null | undefined): string | null => {
  if (!timeValue) return null

  const match = timeValue.match(/(\d+)\s*(am|pm)/i)
  if (!match || !match[1] || !match[2]) return null

  let hour = parseInt(match[1], 10)
  const period = match[2].toLowerCase()

  if (period === 'pm' && hour !== 12) {
    hour += 12
  } else if (period === 'am' && hour === 12) {
    hour = 0
  }

  return `${hour.toString().padStart(2, '0')}:00`
}

// Convert time from "H:i" format to "1 am" format for display
export const convertTimeFromHIFormat = (timeValue: string | null | undefined): string | null => {
  if (!timeValue) return null

  const match = timeValue.match(/(\d{2}):(\d{2})/)
  const hourStr = match?.[1]
  if (!match || !hourStr) return timeValue // Return as-is if not in H:i format

  let hour = parseInt(hourStr, 10)
  const period = hour >= 12 ? 'pm' : 'am'

  if (hour === 0) {
    hour = 12
  } else if (hour > 12) {
    hour -= 12
  }

  return `${hour} ${period}`
}

export const getUserAvatar = (
  first_name: string,
  last_name: string,
  avatar_url?: string,
): string => {
  if (avatar_url) return avatar_url
  return `https://ui-avatars.com/api/?name=${first_name} ${last_name}&background=random`
}


export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}