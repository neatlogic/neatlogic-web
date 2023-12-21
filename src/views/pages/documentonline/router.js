const noAuthority = () => import('@/views/pages/common/no-authority.vue');
const documentonline = () => import('./document/documentonline-help-center.vue');
const documentonlineDetail = () => import('./document/documentonline-detail.vue');
const documentonlineSearch = () => import('./document/documentonline-search.vue');
const directoryManage = () => import('./directory/directory-manage.vue');

import {$t} from '@/resources/init.js';
export default [
  {
    path: '/',
    redirect: '/documentonline'
  },
  {
    path: '/no-authority',
    name: 'no-authority',
    component: noAuthority,
    meta: {
      title: $t('page.pagenotvalid')
    }
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
  }, 
  {
    path: '/directory-manage',
    name: 'directory-manage',
    component: directoryManage,
    meta: {
      title: $t('router.documentonline.directorymanage'),
      authority: 'DOCUMENTONLINE_CONFIG_MODIFY'
    }
  }
];
