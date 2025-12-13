import VaultView from '@/views/vault/VaultView.vue'

export const vaultRoutes = [
  {
    path: '/vaults',
    name: 'App.VaultLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
      flow: 'vault',
    },
    children: [
      {
        path: '',
        name: 'App.VaultView',
        component: VaultView,
        meta: {
          pageTitle: 'Vault',
        },
      },
      {
        path: 'folders/:id?',
        name: 'App.VaultFolderView',
        component: VaultView,
        meta: {
          pageTitle: 'Vault',
        },
      },
    ],
  },
]
