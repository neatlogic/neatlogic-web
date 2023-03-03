const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
//const projectManage = () => import('./project/project-manage.vue');

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
        //通过跳转到中间路由,并立刻返回原路由,实现刷新路由页面的效果
        next({ name: 'refresh', replace: true, query: { path: defaultPage } });
      } else {
        next({ path: defaultPage, replace: true });
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
      title: '页面不存在'
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: welcome
  }
  /*{
    path: '/project-manage/:projectId?',
    name: 'project-manage',
    component: projectManage,
    meta: {
      title: '项目管理',
      ismenu: false,
      icon: 'tsfont-task',
      authority: 'RDM_BASE',
      type: 'project'
    }
  }*/
];

export default routerArr;
