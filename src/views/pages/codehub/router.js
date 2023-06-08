const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const repositoryserveManage = () => import('@/views/pages/codehub/codehub/repository/repositoryserve-manage.vue'); // 代码库服务
const repositoryOverview = () => import('@/views/pages/codehub/codehub/repository/repository-overview.vue'); // 代码仓库
const versionOverview = () => import('@/views/pages/codehub/codehub/version/version-overview.vue');
const versiontypeOverview = () => import('@/views/pages/codehub/codehub/version/versiontype-overview.vue');
const strategyOverview = () => import('@/views/pages/codehub/codehub/version/strategy-overview.vue');
const mergeAction = () => import('@/views/pages/codehub/codehub/merge/merge-action.vue');
const mergeCreate = () => import('@/views/pages/codehub/codehub/merge/merge-create.vue');
const mergeHandler = () => import('@/views/pages/codehub/codehub/merge/merge-handler.vue');
const mergeReview = () => import('@/views/pages/codehub/codehub/merge/merge-review.vue');
const mergeOverview = () => import('@/views/pages/codehub/codehub/merge/merge-overview.vue');
const repositoryDetail = () => import('@/views/pages/codehub/codehub/repository/repository-detail.vue');
const projectOverview = () => import('@/views/pages/codehub/codehub/project/project-overview.vue');
const credentialManage = () => import('@/views/pages/codehub/codehub/repository/credential-manage.vue');
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
      title: $t('router.common.pagenoexist')
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: welcome
  },
  {
    path: '/repositoryserve-manage',
    name: 'repositoryserve-manage',
    component: repositoryserveManage,
    meta: {
      title: $t('router.codehub.repositoryservice'),
      ismenu: true,
      icon: 'tsfont-softwareservice',
      authority: '',
      type: 'codehub'
    }
  },
  {
    path: '/repository-overview',
    name: 'repositoryOverview',
    component: repositoryOverview,
    meta: {
      title: $t('router.codehub.repository'),
      ismenu: true,
      icon: 'tsfont-file-single',
      authority: '',
      type: 'codehub'
    }
  },
  {
    path: '/versiontype-overview',
    name: 'versiontype-overview',
    component: versiontypeOverview,
    meta: {
      title: $t('router.codehub.versiontype'),
      ismenu: true,
      icon: 'tsfont-type',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/version-overview',
    name: 'version-overview',
    component: versionOverview,
    meta: {
      title: $t('router.codehub.versioning'),
      ismenu: true,
      icon: 'tsfont-version',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/strategy-overview',
    name: 'strategy-overview',
    component: strategyOverview,
    meta: {
      title: $t('router.codehub.versionstrategy'),
      ismenu: true,
      icon: 'tsfont-filter',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/merge-create',
    name: 'merge-create',
    component: mergeCreate,
    meta: {
      title: $t('router.codehub.createmergerequest'),
      ismenu: false,
      icon: 'ts-dev-iplist',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/merge-handler',
    name: 'merge-handler',
    component: mergeHandler,
    meta: {
      title: $t('router.codehub.handlermergerequest'),
      ismenu: false,
      icon: 'ts-dev-iplist',
      authrity: '',
      type: 'codehub'
    }
  }, 
  {
    path: '/merge-review',
    name: 'merge-review',
    component: mergeReview,
    meta: {
      title: $t('router.codehub.codereview'),
      ismenu: false,
      icon: 'ts-dev-iplist',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/merge-overview',
    name: 'merge-overview',
    component: mergeOverview,
    meta: {
      title: $t('router.codehub.mergerequestlist'),
      ismenu: true,
      icon: 'tsfont-merge',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/merge-action',
    name: 'merge-action',
    component: mergeAction,
    meta: {
      title: $t('router.codehub.mergeactionmanage'),
      ismenu: true,
      icon: 'tsfont-action',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/repository-detail',
    name: 'repository-detail',
    component: repositoryDetail,
    meta: {
      title: $t('router.codehub.repositorydetail'),
      ismenu: false,
      icon: 'ts-dev-iplist',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/project-overview',
    name: 'project-overview',
    component: projectOverview,
    meta: {
      title: $t('router.codehub.projectmapping'),
      ismenu: true,
      icon: 'tsfont-task',
      authrity: '',
      type: 'codehub'
    }
  },
  {
    path: '/credential-manage',
    name: 'credential-manage',
    component: credentialManage,
    meta: {
      title: $t('router.codehub.repositoryvoucher'),
      ismenu: true,
      icon: 'tsfont-permission',
      authrity: '',
      type: 'codehub'
    }
  }
];
