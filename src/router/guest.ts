import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import OnboardingView from '@/views/auth/OnboardingView.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import SocialAuthenticationView from '@/views/auth/SocialAuthenticationView.vue'

export const guestRoutes = {
  path: '/',
  redirect: { name: 'Guests.LandingView', params: { module: 'welcome' } },
  name: 'Guests.Layout',
  component: GuestLayout,
  meta: {
    layout: 'guest',
  },
  children: [
    {
      path: ':module(welcome|connection|vault)',
      name: 'Guests.LandingView',
      component: () => import('@/views/auth/LandingView.vue'),
      meta: {
        layout: 'guest',
        requiresGuest: true,
      },
    },
    {
      path: '/onboarding/:module(signup)',
      name: 'Guests.OnboardingSignup',
      component: OnboardingView,
      meta: {
        layout: 'guest',
        hasLayoutLogo: ['signup'],
        hasLayoutLeaf: ['signup'],
        requiresGuest: true,
      },
    },
    {
      path: '/onboarding/:module(verify-email|personal-info|seed-phase)',
      name: 'Guests.OnboardingView',
      component: OnboardingView,
      meta: {
        layout: 'guest',
        hasLayoutLogo: ['verify-email', 'personal-info'],
        hasLayoutLeaf: ['verify-email', 'personal-info'],
        requiresAuth: true,
      },
    },
    {
      path: '/signin',
      name: 'Guests.SigninView',
      component: () => import('@/views/auth/SigninView.vue'),
      meta: {
        layout: 'guest',
        requiresGuest: true,
      },
    },
    {
      path: '/auth/:provider(google|facebook|apple)',
      name: 'Guests.SocialAuthenticationView',
      component: () => SocialAuthenticationView,
      meta: {
        layout: 'guest',
        requiresGuest: true,
      },
    },
    {
      path: '/forgot-password/:module(email|otp|reset)',
      name: 'Guests.ForgotPasswordView',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: {
        layout: 'guest',
        requiresGuest: true,
        hasLayoutLogo: ['email', 'otp', 'reset'],
        hasLayoutLeaf: ['email', 'otp', 'reset'],
      },
      beforeEnter: (
        to: RouteLocationNormalized,
        _from: RouteLocationNormalized,
        next: NavigationGuardNext,
      ) => {
        // Only redirect to 'email' if the destination module is not 'email'
        // This prevents infinite loops by checking the destination, not the origin
        if (to.params.module !== 'email') {
          next({ name: 'Guests.ForgotPasswordView', params: { module: 'email' } })
        } else {
          next()
        }
      },
    },
  ],
}
