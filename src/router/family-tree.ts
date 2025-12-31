import FamilyTree from '@/views/family-tree/FamilyTree.vue'
import FamilyTreeLayout from '@/layouts/FamilyTreeLayout.vue'
import FamilyTreeOnboardingView from '@/views/family-tree/FamilyTreeOnboardingView.vue'

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
        component: () => FamilyTreeLayout,
        children: [
          {
            path: ':module(add-member|join-family|edit-member)?',
            name: 'App.FamilyTreeView',
            component: () => FamilyTree,
            meta: {
              pageTitle: 'Family Tree',
              fullScreen: 'web',
            },
          },
          // {
          //   path: 'onboarding/welcome',
          //   name: 'App.FamilyTreeWelcomeView',
          //   component: () => FamilyTreeOnboardingView,
          //   meta: {
          //     pageTitle: 'Family Tree',
          //     hasLayoutLogo: true,
          //     hasLayoutLeaf: false,
          //     fullScreen: 'web',
          //   },
          // },
        ],
      },
      {
        path: ':id',
        name: 'App.FamilyTreeDetailView',
        component: () => FamilyTree,
        meta: {
          pageTitle: 'Family Tree',
        },
      },
      {
        path: 'onboarding/:module(add-member|join-family|complete)',
        name: 'App.FamilyTreeOnboardingView',
        component: () => FamilyTreeOnboardingView,
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
