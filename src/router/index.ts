import { createRouter, createWebHistory } from 'vue-router'
import { guestRoutes } from './guest'
import { dashboardRoutes } from './dashboard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [guestRoutes, ...dashboardRoutes],
})

export default router
