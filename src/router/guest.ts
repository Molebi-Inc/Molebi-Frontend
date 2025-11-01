import OnboardingView from '@/views/auth/OnboardingView.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'

export const guestRoutes = {
  path: '/',
  redirect: { name: 'Guests.LandingView', params: { module: 'welcome' } },
  name: 'Guests.Layout',
  component: GuestLayout,
  children: [
    {
      path: ':module(welcome|connection|vault)',
      name: 'Guests.LandingView',
      component: () => import('@/views/auth/LandingView.vue'),
      meta: {
        layout: 'guest',
      },
    },
    {
      path: '/onboarding/:module(signup|verify-email|success)',
      name: 'Guests.OnboardingView',
      component: OnboardingView,
      meta: {
        layout: 'guest',
        hasLayoutLogo: ['signup', 'verify-email', 'success'],
        hasLayoutLeaf: ['signup', 'verify-email', 'success'],
      },
    },
    {
      path: '/signin',
      name: 'Guests.SigninView',
      component: () => import('@/views/auth/SigninView.vue'),
      meta: {
        layout: 'guest',
      },
    },
    {
      path: '/forgot-password/:module(email|otp|reset|success)',
      name: 'Guests.ForgotPasswordView',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: {
        layout: 'guest',
        hasLayoutLogo: ['email', 'otp', 'reset', 'success'],
        hasLayoutLeaf: ['email', 'otp', 'reset', 'success'],
      },
    },
  ],
}
