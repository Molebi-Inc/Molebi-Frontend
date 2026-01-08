import HomeCardView from '@/views/home/partials/HomeCardView.vue'

export const homeRoutes = [
  {
    path: '/home',
    name: 'App.HomeLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      tour: 'dashboard',
      mobileTour: 'dashboard_mobile',
      disableCentralTour: true,
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'App.HomeView',
        component: () => import('@/views/home/HomeView.vue'),
        meta: {
          pageTitle: 'Hello ',
        },
      },
      {
        path: ':cardType(tradition|announcement)',
        name: 'App.HomeCardView',
        component: () => HomeCardView,
        meta: {
          pageTitle: 'Home',
          fullScreen: 'mobile',
        },
      },
    ],
  },
]
