<template>
  <div>
    <h1>Redirecting ...</h1>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useAuthConfig } from '@/config/auth.config'
import { handleApiError } from '@/helpers/error.helpers'
import type { SocialAuthenticationProvider } from '@/types/authentication.types'
import { useSocialAuthenticationRedirectMutation } from '@/services/authentication.services'
import { useProfileStore } from '@/stores/profile.store'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()
const authConfig = useAuthConfig()
const profileStore = useProfileStore()
const provider = $route.params.provider as SocialAuthenticationProvider
const SocialAuthenticationMutation = useSocialAuthenticationRedirectMutation(provider)

const user = computed(() => profileStore.user)

const handleSocialAuthenticationRedirect = async () => {
  try {
    const response = await SocialAuthenticationMutation.mutateAsync(
      $route.query as Record<string, string>,
    )
    authConfig.setToken(response.data.token)
    profileStore.setStoreProp('user', response.data.user)
    if (user.value && user.value.community_name && user.value.family_tree.state_id) {
      return $router.push({ name: 'App.HomeView' })
    }
    $router.push({ name: 'Guests.OnboardingView', params: { module: 'personal-info' } })
  } catch (error) {
    handleApiError(error, message)
  }
}

onMounted(async () => {
  await handleSocialAuthenticationRedirect()
})
</script>
