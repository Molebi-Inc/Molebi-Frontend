import { createRouter, createWebHistory } from 'vue-router'
import { guestRoutes } from './guest'
import { homeRoutes } from './home.ts'
import { familyTreeRoutes } from './family-tree'
import { storageRoutes } from './storage'
import { vaultRoutes } from './vault'
import { timeCapsuleRoutes } from './time-capsule'
import { settingsRoutes } from './settings'
import { heritageRoutes } from './heritage'

const AUTH_TOKEN_KEY = 'token'
const GUEST_TOKEN_KEY = 'guest_token'
const DEFAULT_AUTH_ROUTE = 'App.HomeView'
const DEFAULT_GUEST_ROUTE = 'Guests.SigninView'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    guestRoutes,
    ...homeRoutes,
    ...familyTreeRoutes,
    ...storageRoutes,
    ...vaultRoutes,
    ...timeCapsuleRoutes,
    ...settingsRoutes,
    ...heritageRoutes,
  ],
})

router.beforeEach((to, _from, next) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(GUEST_TOKEN_KEY)
      : null
  const isAuthenticated = Boolean(token)

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      name: DEFAULT_GUEST_ROUTE,
      query: { redirect: to.fullPath },
    })
    return
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: DEFAULT_AUTH_ROUTE })
    return
  }

  next()
})

export default router
