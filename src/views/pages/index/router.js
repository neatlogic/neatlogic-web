import {$t} from '@/resources/init.js';
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
      title: $t('page.sitenavigation')
    }
  }
];
