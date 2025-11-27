import { useStorage } from '@vueuse/core'

export const useAuthConfig = () => {
  const userToken = useStorage<string | null>('token', null)
  const guestToken = useStorage<string | null>('guest_token', null)
  const otpExpirationInMinutes = useStorage<number | null>('expires_in_minutes', null)
  const otpRequestTime = useStorage<string | null>('otp_request_time', null)

  const setToken = (token: string, isGuest: boolean = false) => {
    if (isGuest) {
      guestToken.value = token
    } else {
      userToken.value = token
    }
  }

  const setOtpExpirationInMinutes = (minutes: number) => {
    otpExpirationInMinutes.value = minutes
  }

  const setOtpRequestTime = (time: string) => {
    otpRequestTime.value = time
  }

  const getOtpExpirationInMinutes = () => {
    return otpExpirationInMinutes.value
  }

  const getOtpRequestTime = () => {
    return otpRequestTime.value
  }

  const getToken = (isGuest: boolean = false) => {
    if (isGuest) {
      return guestToken.value
    }
    return userToken.value
  }

  const removeToken = (isGuest: boolean = false) => {
    if (isGuest) {
      guestToken.value = null
    } else {
      userToken.value = null
    }
  }

  return {
    setToken,
    getToken,
    removeToken,
    setOtpExpirationInMinutes,
    getOtpExpirationInMinutes,
    setOtpRequestTime,
    getOtpRequestTime,
  }
}
