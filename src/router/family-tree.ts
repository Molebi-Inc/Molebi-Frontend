export const familyTreeRoutes = [
  {
    path: '/family-trees',
    name: 'App.FamilyTreeAppLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'App.FamilyTreeLayout',
        component: () => import('@/layouts/FamilyTreeLayout.vue'),
        children: [
          {
            path: ':module(add-member|join-family|edit-member)?',
            name: 'App.FamilyTreeView',
            component: () => import('@/views/family-tree/FamilyTree.vue'),
            meta: {
              pageTitle: 'Family Tree',
              fullScreen: 'web',
            },
          },
          {
            path: 'onboarding/welcome',
            name: 'App.FamilyTreeWelcomeView',
            component: () => import('@/views/family-tree/FamilyTreeOnboardingView.vue'),
            meta: {
              pageTitle: 'Family Tree',
              hasLayoutLogo: true,
              hasLayoutLeaf: false,
              fullScreen: 'web',
            },
          },
        ],
      },
      {
        path: ':id',
        name: 'App.FamilyTreeDetailView',
        component: () => import('@/views/family-tree/FamilyTree.vue'),
        meta: {
          pageTitle: 'Family Tree',
        },
      },
      {
        path: 'onboarding/:module(add-member|join-family|complete)',
        name: 'App.FamilyTreeOnboardingView',
        component: () => import('@/views/family-tree/FamilyTreeOnboardingView.vue'),
        meta: {
          pageTitle: 'Family Tree Onboarding',
          hasLayoutLogo: true,
          hasLayoutLeaf: true,
          fullScreen: 'web',
        },
      },
    ],
  },
]
