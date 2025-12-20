import { computed, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { handleApiError } from '@/helpers/error.helpers'
import type { SocialAuthenticationProvider } from '@/types/authentication.types'
import { useSocialAuthenticationRedirectQuery } from '@/services/authentication.services'

export const useSocialSignin = () => {
  const message = useMessage()
  const providerRef = ref<SocialAuthenticationProvider | undefined>(undefined)
  const socialAuthQuery = useSocialAuthenticationRedirectQuery(providerRef)

  const handleSocialAuthenticationRedirect = async (provider: SocialAuthenticationProvider) => {
    try {
      providerRef.value = provider
      await socialAuthQuery.refetch()
      const redirectUrl = socialAuthQuery.data?.value?.data?.redirect_url
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        throw new Error('Redirect URL not found')
      }
    } catch (error) {
      handleApiError(error, message)
    }
  }

  return {
    handleSocialAuthenticationRedirect,
  }
}
