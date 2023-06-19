const documentonline = () => import('./document/documentonline-help-center.vue');
const documentonlineManage = () => import('./document/documentonline-manage.vue');
const documentonlineDetail = () => import('./document/documentonline-detail.vue');
const documentonlineSearch = () => import('./document/documentonline-search.vue');

import {$t} from '@/resources/init.js';
export default [
  {
    path: '/',
    redirect: '/documentonline'
  },
  {
    path: '/documentonline',
    name: 'documentonline',
    component: documentonline,
    meta: {
      title: $t('router.documentonline.documentonline')
    }
  },
  {
    path: '/documentonline-manage',
    name: 'documentonline-manage',
    component: documentonlineManage,
    meta: {
      title: $t('router.documentonline.documentmanage')
    }
  },
  {
    path: '/documentonline-detail',
    name: 'documentonline-detail',
    component: documentonlineDetail,
    meta: {
      title: $t('router.documentonline.documentdetail')
    }
  }, 
  {
    path: '/documentonline-search',
    name: 'documentonline-search',
    component: documentonlineSearch,
    meta: {
      title: $t('router.documentonline.documentsearch')
    }
  }
];
