import HeritageView from '@/views/heritage/HeritageView.vue'

export const heritageRoutes = [
  {
    path: '/heritage',
    name: 'App.HeritageLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'App.HeritageView',
        component: HeritageView,
        meta: {
          pageTitle: 'Heritage',
        },
      },
    ],
  },
]
