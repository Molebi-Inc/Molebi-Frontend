export const storageRoutes = [
  {
    path: '/storages',
    name: 'App.StorageLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'App.StorageView',
        component: () => import('@/views/storage/StorageView.vue'),
        meta: {
          pageTitle: 'Storage',
        },
      },
    ],
  },
]
