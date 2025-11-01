export const dashboardRoutes = [
  {
    path: '/dashboard',
    name: 'App.DashboardView',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: {
      layout: 'app',
    },
  },
]
