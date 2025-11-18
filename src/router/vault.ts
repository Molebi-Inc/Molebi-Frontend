export const vaultRoutes = [
  {
    path: '/vaults',
    name: 'App.VaultLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'App.VaultView',
        component: () => import('@/views/vault/VaultView.vue'),
        meta: {
          pageTitle: 'Vault',
        },
      },
    ],
  },
]
