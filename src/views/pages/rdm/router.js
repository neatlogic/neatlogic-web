const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const projectEdit = () => import('./project/project-edit.vue');
const project = () => import('@/views/pages/rdm/project/viewtab/project/project.vue');
const taskList = () => import('@/views/pages/rdm/workbench/task-list.vue');
const priorityManage = () => import('@/views/pages/rdm/priority/priority-manage.vue');
const appModules = {
  bugDetail: () => import('@/views/pages/rdm/project/viewtab/bug/bug-detail.vue'),
  storyDetail: () => import('@/views/pages/rdm/project/viewtab/story/story-detail.vue'),
  taskDetail: () => import('@/views/pages/rdm/project/viewtab/task/task-detail.vue'),
  iterationDetail: () => import('@/views/pages/rdm/project/viewtab/iteration/iteration-detail.vue'),
  story: () => import('@/views/pages/rdm/project/viewtab/story/story.vue'),
  bug: () => import('@/views/pages/rdm/project/viewtab/bug/bug.vue'),
  task: () => import('@/views/pages/rdm/project/viewtab/task/task.vue'),
  iteration: () => import('@/views/pages/rdm/project/viewtab/iteration/iteration.vue')
};

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
      title: $t('page.pagenotvalid')
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: welcome
  },
  {
    path: '/project-edit/:projectId?',
    name: 'project-edit',
    component: projectEdit,
    meta: {
      ismenu: false,
      icon: 'tsfont-task',
      authority: 'RDM_BASE',
      type: 'project'
    }
  },
  {
    path: '/project/:projectId?',
    name: 'project',
    component: project,
    meta: {
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  },
  {
    path: '/task-list/doing',
    name: 'taskList',
    component: taskList,
    meta: {
      title: $t('router.rdm.mydoing'),
      ismenu: true,
      type: 'workbrench',
      authority: 'RDM_BASE',
      icon: 'tsfont-formdynamiclist'
    }
  },
  {
    path: '/task-list/done',
    name: 'taskList',
    component: taskList,
    meta: {
      title: $t('router.rdm.mycompleted'),
      ismenu: true,
      type: 'workbrench',
      authority: 'RDM_BASE',
      icon: 'tsfont-check-o'
    }
  },
  {
    path: '/priority-manage',
    name: 'priorityManage',
    component: priorityManage,
    meta: {
      title: $t('router.rdm.prioritymanage'),
      ismenu: true,
      type: 'system',
      authority: 'PRIORITY_MANAGE',
      icon: 'tsfont-check-o'
    }
  }
];
const appList = ['story', 'bug', 'task', 'iteration'];
appList.forEach(app => {
  routerArr.push({
    path: '/' + app + '/:projectId/:appId',
    name: app,
    component: appModules[app],
    meta: {
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  });
  routerArr.push({
    path: '/' + app + '-detail/:projectId/:appId/:id',
    name: app + '-detail',
    component: appModules[app + 'Detail'],
    meta: {
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  });
});
export default routerArr;
