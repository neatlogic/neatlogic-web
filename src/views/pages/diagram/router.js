const refresh = () => import('@/views/pages/common/refresh.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const graphEdit = () => import('./graph/graph-edit.vue');
const widgetManage = () => import('./widget/widget-manage.vue');
const widgetEdit = () => import('./widget/widget-edit.vue');
const templateEdit = () => import('@/views/pages/diagram/template/template-edit.vue');

import { $t } from '@/resources/init.js';
let routerArr = [
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
    },
    meta: {
      icon: 'ts-file'
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: welcome
  },
  {
    path: '/refresh',
    name: 'refresh',
    component: refresh
  },
  {
    path: '/graph-edit',
    name: 'graph-edit',
    component: graphEdit,
    meta: {
      title: $t('router.diagram.diagrammanage'),
      ismenu: true,
      icon: 'tsfont-component',
      type: 'diagrammanage',
      authority: 'DIAGRAM_BASE'
    }
  },
  {
    path: '/template-edit',
    name: 'template-edit',
    component: templateEdit,
    meta: {
      title: '编辑模板',
      ismenu: false,
      authority: 'DIAGRAM_TEMPLATE_MODIFY'
    }
  },
  {
    path: '/widget-manage',
    name: 'widget-manage',
    component: widgetManage,
    meta: {
      title: '组件管理',
      ismenu: true,
      icon: 'tsfont-component',
      type: 'diagrammanage',
      authority: 'DIAGRAM_BASE'
    }
  },
  {
    path: '/widget-edit',
    name: 'widget-edit',
    component: widgetEdit,
    meta: {
      title: '组件编辑',
      type: 'diagrammanage',
      authority: 'DIAGRAM_BASE'
    }
  }
];

export default routerArr;
