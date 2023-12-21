const refresh = () => import('@/views/pages/common/refresh.vue');
//const noAuthority = () => import('@/views/pages/common/no-authority.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const SearchIndex = () => import('./index/search-index.vue');
import { $t } from '@/resources/init.js';
export default [
  {
    path: '/',
    beforeEnter: (to, from, next) => {
      let defaultPage = '';
      try {
        const moduleList = JSON.parse(localStorage.getItem('moduleList'));
        defaultPage =
          moduleList.find(module => {
            return module.moduleId === MODULEID;
          }).defaultPage || '/welcome';
      } catch {
        defaultPage = '/welcome';
      }
      if (from.path === defaultPage) {
        next({ name: 'refresh', replace: true, query: { path: defaultPage } });
      } else {
        next({ path: defaultPage, replace: true });
      }
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: SearchIndex
  },
  {
    path: '/refresh',
    name: 'refresh',
    component: refresh
  },
  {
    path: '/search-index',
    name: 'search-index',
    component: SearchIndex,
    meta: {
      title: $t('router.globalsearch.searchcenter'),
      istitle: true,
      authority: 'GLOBALSEARCH_BASE',
      icon: 'tsfont-listsetting'
    }
  }
];
