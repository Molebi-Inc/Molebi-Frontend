import VaultView from '@/views/vault/VaultView.vue'
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
        component: StorageLayout,
        children: [
          {
            path: 'onboarding/welcome',
            name: 'App.StorageWelcomeView',
            component: StorageView,
            meta: {
              pageTitle: 'Storage',
              hasLayoutLogo: true,
              hasLayoutLeaf: false,
              fullScreen: 'web',
            },
          },
          {
            path: 'onboarding/family-info',
            name: 'App.StorageFamilyInfoView',
            component: StorageView,
            meta: {
              hasLayoutLogo: true,
              hasLayoutLeaf: true,
              fullScreen: 'web',
              pageTitle: 'Storage',
            },
          },
          {
            path: 'folders/:id?',
            name: 'App.StorageFolderView',
            component: VaultView,
            meta: {
              pageTitle: 'Storage',
            },
          },
        ],
      },
    ],
  },
]
