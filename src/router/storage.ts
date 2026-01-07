import StorageView from '@/views/storage/StorageView.vue'
import StorageLayout from '@/layouts/StorageLayout.vue'

export const storageRoutes = [
  {
    path: '/storages',
    name: 'App.StorageAppLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
      flow: 'storage',
    },
    children: [
      {
        path: '',
        name: 'App.StorageLayout',
        redirect: { name: 'App.StorageFolderView' },
        component: StorageLayout,
        children: [
          {
            path: 'folders/:id?',
            name: 'App.StorageFolderView',
            component: () => import('@/views/vault/VaultView.vue'),
            meta: {
              pageTitle: 'Storage',
            },
          },
        ],
      },
    ],
  },
]
