import { vaultRoutes } from './vault'
import { guestRoutes } from './guest'
import { homeRoutes } from './home'
import { storageRoutes } from './storage'
import { settingsRoutes } from './settings'
import { heritageRoutes } from './heritage'
import { familyTreeRoutes } from './family-tree'
import { timeCapsuleRoutes } from './time-capsule'
import { heritageVaultRoutes } from './heritage-vault'
import { createRouter, createWebHistory } from 'vue-router'

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
    ...heritageVaultRoutes,
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
