export const storageRoutes = [
  {
    path: '/storages',
    name: 'App.StorageLayout',
    component: () => import('@/layouts/AppLayoutV2.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
      flow: 'storage',
    },
    children: [
      {
        path: '',
        name: 'App.StorageFolderView',
        component: () => import('@/views/storage/MemoriesView.vue'),
        meta: {
          pageTitle: 'Memories',
        },
      },
    ],
  },
]
