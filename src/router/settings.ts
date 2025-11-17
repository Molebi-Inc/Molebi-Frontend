export const settingsRoutes = [
  {
    path: '/settings',
    name: 'App.SettingsLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'App.SettingsView',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: {
          pageTitle: 'Settings',
        },
      },
    ],
  },
]
