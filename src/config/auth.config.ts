import { useStorage } from '@vueuse/core'

export const useAuthConfig = () => {
  const userToken = useStorage<string | null>('token', null)

  const setToken = (token: string) => {
    userToken.value = token
  }
  const getToken = () => {
    return userToken.value
  }
  const removeToken = () => {
    userToken.value = null
  }

  return {
    setToken,
    getToken,
    removeToken,
  }
}
