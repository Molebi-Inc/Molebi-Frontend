import FamilyTree from '@/views/family-tree/FamilyTree.vue'
// import FamilyTreeV2 from '@/views/family-tree-v2/FamilyTreeV2.vue'
import FamilyTreeLayout from '@/layouts/FamilyTreeLayout.vue'
import FamilyTreeOnboardingView from '@/views/family-tree/FamilyTreeOnboardingView.vue'
import AppLayout from '@/layouts/AppLayout.vue'

export const familyTreeRoutes = [
  // Family Tree V2 Route
  // {
  //   path: '/family-trees-v2',
  //   name: 'App.FamilyTreeV2AppLayout',
  //   component: AppLayout,
  //   meta: {
  //     layout: 'app',
  //     requiresAuth: true,
  //   },
  //   children: [
  //     {
  //       path: '',
  //       name: 'App.FamilyTreeV2View',
  //       component: FamilyTreeV2,
  //       meta: {
  //         pageTitle: 'Family Tree V2',
  //         fullScreen: 'web',
  //       },
  //     },
  //   ],
  // },
  // Original Family Tree Route
  {
    path: '/family-trees',
    name: 'App.FamilyTreeAppLayout',
    component: AppLayout,
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'App.FamilyTreeLayout',
        component: FamilyTreeLayout,
        children: [
          {
            path: ':module(add-member|join-family|edit-member)?',
            name: 'App.FamilyTreeView',
            component: FamilyTree,
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
        component: FamilyTree,
        meta: {
          pageTitle: 'Family Tree',
        },
      },
      {
        path: 'onboarding/:module(add-member|join-family|complete)',
        name: 'App.FamilyTreeOnboardingView',
        component: FamilyTreeOnboardingView,
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
