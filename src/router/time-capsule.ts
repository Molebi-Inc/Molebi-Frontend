import TimeCapsule from '@/views/time-capsules/TimeCapsule.vue'
export const timeCapsuleRoutes = [
  {
    path: '/time-capsules',
    name: 'App.TimeCapsuleLayout',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
      tour: 'time-capsule',
      fullScreen: 'mobile-footer',
    },
    children: [
      {
        path: '',
        name: 'App.TimeCapsules.View',
        component: TimeCapsule,
        meta: {
          pageTitle: 'Time Capsule',
        },
      },
      {
        path: ':id',
        name: 'App.TimeCapsules.Details',
        component: TimeCapsule,
        meta: {
          pageTitle: 'Time Capsule',
        },
      },
      {
        path: ':id/edit/:step(1|2)?',
        name: 'App.TimeCapsules.Edit',
        component: TimeCapsule,
        meta: {
          pageTitle: 'Time Capsule',
        },
      },
      {
        path: ':id/delete',
        name: 'App.TimeCapsules.Delete',
        component: TimeCapsule,
        meta: {
          pageTitle: 'Time Capsule',
        },
      },
      {
        path: 'create/:step(1|2)?',
        name: 'App.TimeCapsules.Create',
        component: TimeCapsule,
        meta: {
          pageTitle: 'Time Capsule',
        },
      },
    ],
  },
]
