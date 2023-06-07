import {$t} from '@/resources/init.js';
export default [
  {
    path: '/',
    redirect: '/help'
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('./search/index.vue'),
    meta: {
      title: '帮助中心'
    }
  }
];
