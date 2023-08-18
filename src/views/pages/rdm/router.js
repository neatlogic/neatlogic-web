const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const projectEdit = () => import('./project/project-edit.vue');
const project = () => import('@/views/pages/rdm/project/viewtab/project/project.vue');
const taskList = () => import('@/views/pages/rdm/workbench/task-list.vue');
const projectManage = () => import('@/views/pages/rdm/project/project-manage.vue');
const priorityManage = () => import('@/views/pages/rdm/priority/priority-manage.vue');
const templateManage = () => import('@/views/pages/rdm/template/template-manage.vue');
const templateEdit = () => import('@/views/pages/rdm/template/template-edit.vue');
const dashboardEdit = () => import('@/views/pages/rdm/project/viewtab/dashboard/dashboard-edit.vue');
const appModules = {
  bugDetail: () => import('@/views/pages/rdm/project/viewtab/bug/bug-detail.vue'),
  storyDetail: () => import('@/views/pages/rdm/project/viewtab/story/story-detail.vue'),
  taskDetail: () => import('@/views/pages/rdm/project/viewtab/task/task-detail.vue'),
  iterationDetail: () => import('@/views/pages/rdm/project/viewtab/iteration/iteration-detail.vue'),
  testcaseDetail: () => import('@/views/pages/rdm/project/viewtab/testcase/testcase-detail.vue'),
  testplanDetail: () => import('@/views/pages/rdm/project/viewtab/testplan/testplan-detail.vue'),
  dashboardDetail: () => import('@/views/pages/rdm/project/viewtab/dashboard/dashboard-detail.vue'),
  story: () => import('@/views/pages/rdm/project/viewtab/story/story.vue'),
  bug: () => import('@/views/pages/rdm/project/viewtab/bug/bug.vue'),
  task: () => import('@/views/pages/rdm/project/viewtab/task/task.vue'),
  iteration: () => import('@/views/pages/rdm/project/viewtab/iteration/iteration.vue'),
  testcase: () => import('@/views/pages/rdm/project/viewtab/testcase/testcase.vue'),
  gitlab: () => import('@/views/pages/rdm/project/viewtab/gitlab/gitlab.vue'),
  testplan: () => import('@/views/pages/rdm/project/viewtab/testplan/testplan.vue'),
  gantt: () => import('@/views/pages/rdm/project/viewtab/gantt/gantt.vue'),
  dashboard: () => import('@/views/pages/rdm/project/viewtab/dashboard/dashboard.vue'),
  storywall: () => import('@/views/pages/rdm/project/viewtab/storywall/storywall.vue')
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
      title: $t('router.rdm.projectconfig'),
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
    props: { type: 'doing' },
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
    props: { type: 'done' },
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
    path: '/task-list/mycreated',
    name: 'taskList',
    props: { type: 'mycreated' },
    component: taskList,
    meta: {
      title: $t('router.rdm.myreported'),
      ismenu: true,
      type: 'workbrench',
      authority: 'RDM_BASE',
      icon: 'tsfont-upload'
    }
  },
  {
    path: '/task-list/favorite',
    name: 'taskList',
    props: { type: 'favorite' },
    component: taskList,
    meta: {
      title: $t('router.rdm.favorite'),
      ismenu: true,
      type: 'workbrench',
      authority: 'RDM_BASE',
      icon: 'tsfont-star'
    }
  },
  {
    path: '/project-manage',
    name: 'projectManage',
    component: projectManage,
    meta: {
      title: $t('router.rdm.projectmanage'),
      ismenu: true,
      type: 'system',
      authority: 'PROJECT_MANAGE',
      icon: 'tsfont-agent'
    }
  },
  {
    path: '/template-manage',
    name: 'templateManage',
    component: templateManage,
    meta: {
      title: $t('router.rdm.templatemanage'),
      ismenu: true,
      type: 'system',
      authority: 'PROJECT_TEMPLATE_MANAGE',
      icon: 'tsfont-formtextarea'
    }
  },
  {
    path: '/template-edit/:templateId?',
    name: 'templateEdit',
    component: templateEdit,
    meta: {
      title: $t('router.rdm.edittemplate'),
      ismenu: false,
      type: 'system',
      authority: 'PROJECT_TEMPLATE_MANAGE'
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
  },
  {
    path: '/dashboard-edit/:projectId/:appId/:id?',
    name: 'dashboardEdit',
    component: dashboardEdit,
    meta: {
      title: $t('router.rdm.editdashboard')
    }
  }
];
const appList = ['story', 'bug', 'task', 'iteration', 'storywall', 'testcase', 'gitlab', 'testplan', 'gantt', 'dashboard'];
appList.forEach(app => {
  if (appModules[app]) {
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
  }
  if (appModules[app + 'Detail']) {
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
  }
});
export default routerArr;
