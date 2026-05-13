<template>
  <div class="bg-brand-green min-h-screen flex flex-col">
    <!-- Logo -->
    <header class="px-6 py-6 md:px-14 md:py-10 shrink-0">
      <img src="@/assets/svg/logo.svg" alt="Molebi" class="h-9 md:h-14 w-auto" />
    </header>

    <!-- Centered content -->
    <div class="flex-1 flex items-center justify-center px-6 py-8">
      <!-- Loading -->
      <div v-if="isFetching" class="flex flex-col items-center gap-4 text-neutral-500">
        <div class="w-10 h-10 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
        <span class="text-sm">Loading invitation...</span>
      </div>

      <!-- Missing or invalid link -->
      <div v-else-if="!inviteParams" class="text-center text-neutral-500 text-sm max-w-xs">
        This invitation link is invalid. Check that the URL includes token, expires, and signature.
      </div>

      <!-- Not found -->
      <div v-else-if="!invitationDetails" class="text-center text-neutral-500 text-sm max-w-xs">
        Invitation not found or has expired.
      </div>

      <!-- Invitation content -->
      <div v-else class="w-full max-w-md flex flex-col gap-6 md:gap-8">
        <!-- Title + subtitle -->
        <div class="text-center space-y-3">
          <h1 class="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
            Welcome back to Molebi!
          </h1>
          <p class="text-neutral-600 text-sm md:text-base leading-relaxed">
            You have been invited to join the
            <strong class="text-neutral-600 font-semibold">
              {{ invitationDetails.family_tree.name }}
            </strong>
            by
            <strong class="text-neutral-600 font-semibold">{{ invitationDetails?.invited_by?.name }}</strong>
            your {{ invitationDetails.relation_type_label }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <button type="button"
            class="w-full py-4 rounded-full bg-primary text-white font-semibold text-base transition-colors hover:bg-primary-800 active:bg-primary-900 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isAccepting || isDeclining" @click="handleAccept">
            {{ isAccepting ? 'Please wait...' : 'Accept & continue' }}
          </button>
          <button type="button"
            class="w-full py-3 rounded-full border border-neutral-300 bg-white text-neutral-700 font-medium text-sm transition-colors hover:bg-neutral-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isAccepting || isDeclining" @click="handleDecline">
            {{ isDeclining ? 'Please wait...' : 'Decline invitation' }}
          </button>
        </div>

        <!-- Privacy notice -->
        <div class="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-2xl px-4 py-4">
          <svg class="shrink-0 mt-0.5 text-primary-700" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <p class="text-primary-700 text-sm leading-relaxed">
            <strong class="font-bold">Your information is private</strong>
            and only visible to family members invited to join.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  useFetchExistingUserInvitationQuery,
  useAcceptExistingUserInvitationMutation,
  useDeclineExistingUserInvitationMutation,
} from '@/services/authentication.services'
import { handleApiError } from '@/helpers/error.helpers'

const $route = useRoute()
const $router = useRouter()
const message = useMessage()

const isAccepting = ref(false)
const isDeclining = ref(false)

/** Expected query: ?token=&expires=&signature= */
const inviteParams = computed(() => {
  const token = String($route.query.token ?? '').trim()
  const signature = String($route.query.signature ?? '').trim()
  const expiresRaw = $route.query.expires
  if (!token || !signature || expiresRaw === undefined || expiresRaw === null || expiresRaw === '') {
    return null
  }
  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires)) return null
  return { token, expires, signature }
})

const { isLoading: isFetching, data: invitationQueryData } = useFetchExistingUserInvitationQuery(inviteParams)
const invitationDetails = computed(() => invitationQueryData.value?.data ?? null)
const acceptMutation = useAcceptExistingUserInvitationMutation(inviteParams)
const declineMutation = useDeclineExistingUserInvitationMutation(inviteParams)

const handleAccept = async () => {
  if (!inviteParams.value) return
  isAccepting.value = true
  try {
    const response = await acceptMutation.mutateAsync()
    message.success(response.message ?? "You're in — welcome to the family space.")
    await $router.push({ name: 'App.HomeView' })
  } catch (error) {
    handleApiError(error, message)
  } finally {
    isAccepting.value = false
  }
}

const handleDecline = async () => {
  if (!inviteParams.value) return
  isDeclining.value = true
  try {
    const response = await declineMutation.mutateAsync()
    message.info(response.message ?? 'Invitation declined.')
    await $router.push({ name: 'Guests.WelcomeView' })
  } catch (error) {
    handleApiError(error, message)
  } finally {
    isDeclining.value = false
  }
}

onMounted(() => {
  if ($route.params.action === 'accept') {
    handleAccept()
  }
  if ($route.params.action === 'decline') {
    handleDecline()
  }
})
</script>
