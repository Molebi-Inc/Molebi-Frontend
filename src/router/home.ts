import HomeView2 from '@/views/home/HomeView2.vue'
import HomeCardView from '@/views/home/partials/HomeCardView.vue'

export const homeRoutes = [
  {
    path: '/home',
    name: 'App.HomeLayout',
    component: () => import('@/layouts/AppLayoutV2.vue'),
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
        component: () => HomeView2,//import('@/views/home/HomeView.vue'),
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
