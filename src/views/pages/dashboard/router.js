const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const dashboardDetail = () => import('./dashboard-detail.vue');
const dashboardEdit = () => import('./dashboard-edit.vue');
const dashboardManage = () => import('./dashboard-manage.vue');
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
        //通过跳转到中间路由,并立刻返回原路由,实现刷新路由页面的效果
        next({ name: 'refresh', replace: true, query: { path: defaultPage} });
      } else {
        next({ path: defaultPage, replace: true});
      }
    }
  },
  {
    path: '/refresh',
    name: 'refresh',
    component: refresh
  },
  {
    path: '/404',
    name: '404',
    component: page404,
    meta: {
      title: 'page.pagenotvalid'
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: welcome
  },
  {
    path: '/dashboard-detail/:id?',
    name: 'dashboard-detail',
    component: dashboardDetail,
    meta: {
      title: 'router.dashboard.dashboarddetail',
      ismenu: false,
      icon: 'tsfont-chart-pie',
      authority: 'DASHBOARD_BASE'
    }
  },
  {
    path: '/dashboard-edit/:id?',
    name: 'dashboard-edit',
    component: dashboardEdit,
    meta: {
      title: 'term.dashboard.editdashboard',
      ismenu: false,
      icon: 'tsfont-chart-pie'
    }
  },
  {
    path: '/dashboard-manage',
    name: 'dashboard-manage',
    component: dashboardManage,
    meta: {
      title: 'router.dashboard.dashboardmanage',
      ismenu: true,
      icon: 'tsfont-blocklist',
      type: 'overview',
      authority: 'DASHBOARD_MODIFY'
    }
  }
];
