import type { RouteRecordRaw } from 'vue-router'

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: 'App.SettingsLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
      fullScreen: 'mobile',
    },
    children: [
      {
        path: ':section(profile|tree|privacy|security|notification|help|about)?',
        name: 'App.SettingsView',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: {
          pageTitle: 'Settings',
        },
      },
    ],
  },
]
