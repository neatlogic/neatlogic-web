export default [
  {
    path: '/',
    redirect: '/navigation'
  },
  {
    path: '/navigation',
    name: 'navigation',
    component: () => import('./navigation/navigation.vue'),
    meta: {
      title: '网站导航'
    }
  }
];
