const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const projectEdit = () => import('./project/project-edit.vue');
const bugDetail = () => import('@/views/pages/rdm/project/viewtab/bug/bug-detail.vue');
const storyDetail = () => import('@/views/pages/rdm/project/viewtab/story/story-detail.vue');
const project = () => import('@/views/pages/rdm/project/viewtab/project/project.vue');
const story = () => import('@/views/pages/rdm/project/viewtab/story/story.vue');
const bug = () => import('@/views/pages/rdm/project/viewtab/bug/bug.vue');
const task = () => import('@/views/pages/rdm/project/viewtab/task/task.vue');

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
      title: $t('router.rdm.projectmanage'),
      ismenu: false,
      icon: 'tsfont-task',
      authority: 'RDM_BASE',
      type: 'project'
    }
  },
  {
    path: '/story-detail/:projectId/:appId/:issueId',
    name: 'story-detail',
    component: storyDetail,
    meta: {
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  },
  {
    path: '/bug-detail/:projectId/:appId/:issueId',
    name: 'bug-detail',
    component: bugDetail,
    meta: {
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  },
  {
    path: '/project/:projectId?',
    name: 'project',
    component: project,
    meta: {
      title: $t('router.rdm.projectdetail'),
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  },
  {
    path: '/story/:projectId/:appId',
    name: 'story',
    component: story,
    meta: {
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  },
  {
    path: '/bug/:projectId/:appId',
    name: 'bug',
    component: bug,
    meta: {
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  },
  {
    path: '/task/:projectId/:appId',
    name: 'task',
    component: task,
    meta: {
      ismenu: false,
      authority: 'RDM_BASE',
      type: 'project'
    }
  }
];

export default routerArr;
