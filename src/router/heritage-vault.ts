import HeritageVaultView from '@/views/heritage-vault/HeritageVaultView.vue'
import HeritageVaultGalleryView from '@/views/heritage-vault/HeritageVaultGalleryView.vue'

export const heritageVaultRoutes = [
  {
    path: '/heritage-vault',
    name: 'App.HeritageVaultLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: ':module(family-archive|time-capsule)?',
        name: 'App.HeritageVaultView',
        component: HeritageVaultView,
        meta: {
          pageTitle: 'Heritage Vault',
          fullScreen: 'mobile-footer',
        },
        children: [
          {
            path: ':submodule(storage|vault)',
            name: 'App.HeritageVaultView.Folders',
            component: HeritageVaultView,
            children: [
              {
                path: ':id',
                name: 'App.HeritageVaultView.Gallery',
                component: HeritageVaultGalleryView,
              },
            ],
          },
        ],
      },
    ],
  },
]
