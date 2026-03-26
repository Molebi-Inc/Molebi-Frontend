export const storageRoutes = [
  {
    path: '/storages',
    name: 'App.StorageLayout',
    component: () => import('@/layouts/AppLayoutV2.vue'),
    // Always land on the leaf route so <router-view> gets MemoriesView. Navigating by parent
    // name alone can leave the nested default child unmatched in some cases (blank page).
    redirect: { name: 'App.StorageFolderView' },
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
      {
        path: 'folders/:id',
        name: 'App.StorageFolderDetailsView',
        component: () => import('@/views/storage/MemoriesView.vue'),
        meta: {
          pageTitle: 'Album Details',
        },
      },
    ],
  },
]
