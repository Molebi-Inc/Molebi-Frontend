export const familyTreeRoutes = [
  {
    path: '/family-trees',
    name: 'App.FamilyTreeLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'App.FamilyTreeView',
        component: () => import('@/views/family-tree/FamilyTree.vue'),
        meta: {
          pageTitle: 'Family Tree',
        },
      },
    ],
  },
]
