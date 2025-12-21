import HeritageVaultView from '@/views/heritage-vault/HeritageVaultView.vue'
import HeritageVaultGalleryView from '@/views/heritage-vault/HeritageVaultGalleryView.vue'

export const heritageVaultRoutes = [
  {
    path: '/family-archive',
    name: 'App.HeritageVaultLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: ':module(storage|vault)/:page(folders)?',
        name: 'App.HeritageVaultView',
        component: HeritageVaultView,
        meta: {
          pageTitle: 'Heritage Vault',
          fullScreen: 'mobile-footer',
        },
        children: [
          {
            path: ':id(\\d+)',
            name: 'App.HeritageVaultView.Gallery',
            component: HeritageVaultGalleryView,
          },
        ],
      },
    ],
  },
]
