const documentonline = () => import('./document/index.vue');
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
      title: '帮助中心'
    }
  },
  {
    path: '/documentonline-manage',
    name: 'documentonline-manage',
    component: documentonlineManage,
    meta: {
      title: '文档列表'
    }
  },
  {
    path: '/documentonline-detail',
    name: 'documentonline-detail',
    component: documentonlineDetail,
    meta: {
      title: '文档详情'
    }
  }, 
  {
    path: '/documentonline-search',
    name: 'documentonline-search',
    component: documentonlineSearch,
    meta: {
      title: '文档搜索'
    }
  }
];
