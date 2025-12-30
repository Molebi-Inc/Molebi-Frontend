<template>
  <div>
    <h1>Redirecting ...</h1>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useAuthConfig } from '@/config/auth.config'
import { handleApiError } from '@/helpers/error.helpers'
import type { SocialAuthenticationProvider } from '@/types/authentication.types'
import { useSocialAuthenticationRedirectMutation } from '@/services/authentication.services'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const authConfig = useAuthConfig()
const provider = $route.params.provider as SocialAuthenticationProvider
const SocialAuthenticationMutation = useSocialAuthenticationRedirectMutation(provider)

const handleSocialAuthenticationRedirect = async () => {
  try {
    const response = await SocialAuthenticationMutation.mutateAsync(
      $route.query as Record<string, string>,
    )
    authConfig.setToken(response.data.token)
    $router.push({ name: 'App.HomeView' })
  } catch (error) {
    handleApiError(error, message)
  }
}

onMounted(async () => {
  await handleSocialAuthenticationRedirect()
})
</script>
