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
