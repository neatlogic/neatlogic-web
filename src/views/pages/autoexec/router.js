const refresh = () => import('@/views/pages/common/refresh.vue');
const noAuthority = () => import('@/views/pages/common/no-authority.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const actionManage = () => import('./manage/action-manage.vue');
const jobManage = () => import('./manage/job-manage.vue');
const jobOverview = () => import('./manage/job-overview.vue');
const actionDetail = () => import('./detail/action-detail.vue');
const runnerDetail = () => import('./detail/runner-detail.vue');
const jobDetail = () => import('./detail/job-detail.vue');
const toolManage = () => import('./manage/tool-manage.vue');
const scriptManage = () => import('./manage/script-manage.vue');
const typeManage = () => import('./manage/type-manage.vue');
const operateManage = () => import('./manage/operate-manage.vue');
const scriptDetail = () => import('./detail/script-detail.vue');
const scriptAdd = () => import('./detail/script-add.vue');
const toolDetail = () => import('./detail/tool-detail.vue');
const reviewDetail = () => import('./detail/review-detail.vue');
const testDetail = () => import('./detail/test-detail.vue');
const timeJobList = () => import('./manage/time-job-list.vue'); // 定时作业列表
const timeJobAdd = () => import('./detail/time-job-add.vue'); // 新增定时作业
const timeJobDetail = () => import('./detail/time-job-detail.vue'); // 编辑定时作业
const toolCatalogManage = () => import('./manage/tool-catalog-manage.vue'); // 工具目录管理
const sceneDefinitionManage = () => import('./config/scene-definition/scene-definition-manage.vue'); // 场景定义
const globalParamsManage = () => import('./config/global-params/global-params-manage.vue'); // 全局参数
const toolProfileManage = () => import('./config/profile/tool-profile-manage.vue'); // 工具profile

const batchPublishingJobEdit = () => import('@/views/pages/deploy/job/batch-job-edit.vue');//修改批量作业
const batchPublishingJobExecute = () => import('@/views/pages/deploy/job/batch-job-detail.vue');//执行批量作业
const publishingJobExecute = () => import('@/views/pages/deploy/job/job-add.vue');//执行发布作业

const customTemplateManage = () => import('./manage/customtemplate/customtemplate-manage.vue');//自定义模板管理

// 快捷服务
const serviceCatalogManage = () => import('./quick-service/service-catalog/service-catalog-manage.vue');
const catalogManage = () => import('./quick-service/catalog/catalog-manage.vue');
const addJob = () => import('./quick-service/service-catalog/add-job.vue'); // 创建作业

import {$t} from '@/resources/init.js';
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
    path: '/no-authority',
    name: 'no-authority',
    component: noAuthority,
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
    path: '/job-manage',
    name: 'job-manage',
    component: jobManage,
    meta: {
      title: $t('router.autoexec.jobmanage'),
      ismenu: true,
      icon: 'tsfont-history',
      authority: 'AUTOEXEC_BASE',
      type: 'job'
    }
  },

  {
    path: '/time-job-list',
    name: 'time-job-list',
    component: timeJobList,
    meta: {
      title: $t('router.autoexec.timejob'),
      ismenu: true,
      icon: 'tsfont-formtime',
      authority: 'AUTOEXEC_MODIFY',
      type: 'job'
    }
  },

  {
    path: '/time-job-add',
    name: 'time-job-add',
    component: timeJobAdd,
    meta: {
      title: $t('router.autoexec.timejob'),
      ismenu: false,
      icon: 'tsfont-formtime',
      authority: 'AUTOEXEC_MODIFY',
      type: 'detail'
    }
  },
  {
    path: '/time-job-detail',
    name: 'time-job-detail',
    component: timeJobDetail,
    meta: {
      title: $t('router.autoexec.timejob'),
      ismenu: false,
      icon: 'tsfont-formtime',
      authority: 'AUTOEXEC_MODIFY',
      type: 'detail'
    }
  },
  {
    path: '/job-overview',
    name: 'job-overview',
    component: jobOverview,
    meta: {
      title: $t('router.autoexec.joblist'),
      ismenu: false,
      icon: 'tsfont-history',
      authority: '',
      type: 'detail'
    }
  },
  {
    path: '/job-detail',
    name: 'job-detail',
    component: jobDetail,
    meta: {
      title: $t('router.autoexec.jobdetail'),
      ismenu: false,
      icon: 'tsfont-history',
      authority: '',
      type: 'detail'
    }
  },
  {
    path: '/batch-job-edit',
    name: 'batch-job-edit',
    component: batchPublishingJobEdit,
    meta: {
      title: $t('router.autoexec.editthebatchpublishjob'),
      ismenu: false
    }
  },
  {
    path: '/batch-job-detail',
    name: 'batch-job-detail',
    component: batchPublishingJobExecute,
    meta: {
      title: $t('router.autoexec.executebatchpublishjob'),
      ismenu: false
    }
  },
  {
    path: '/job-add',
    name: 'job-add',
    component: publishingJobExecute,
    meta: {
      title: $t('router.autoexec.executepublishjob'),
      ismenu: false
    }
  },
  {
    path: '/action-manage',
    name: 'action-manage',
    component: actionManage,
    meta: {
      title: $t('router.autoexec.combinationtool'),
      ismenu: true,
      icon: 'tsfont-flow',
      authority: 'AUTOEXEC_COMBOP_SEARCH',
      type: 'tool'
    }
  },
  {
    path: '/action-detail',
    name: 'action-detail',
    component: actionDetail,
    meta: {
      title: $t('router.autoexec.combinationtooldetail'),
      ismenu: false,
      icon: 'tsfont-calendar',
      authority: 'AUTOEXEC_COMBOP_SEARCH',
      type: 'detail'
    }
  },

  {
    path: '/runner-detail',
    name: 'runner-detail',
    component: runnerDetail,
    meta: {
      title: $t('page.execute'),
      ismenu: false,
      icon: 'tsfont-run',
      authority: 'AUTOEXEC_COMBOP_SEARCH',
      type: 'detail'
    }
  },
  {
    path: '/tool-manage',
    name: 'tool-manage',
    component: toolManage,
    meta: {
      title: $t('router.autoexec.toollibrary'),
      ismenu: true,
      icon: 'tsfont-tool',
      authority: 'AUTOEXEC_SCRIPT_SEARCH',
      type: 'tool'
    }
  },
  {
    path: '/script-manage',
    name: 'script-manage',
    component: scriptManage,
    meta: {
      title: $t('router.autoexec.customtoollibrary'),
      ismenu: true,
      icon: 'tsfont-script',
      authority: 'AUTOEXEC_SCRIPT_SEARCH',
      type: 'tool'
    }
  },
  {
    path: '/script-detail',
    name: 'script-detail',
    component: scriptDetail,
    meta: {
      title: $t('router.autoexec.scriptdetails'),
      ismenu: false,
      icon: 'tsfont-script',
      authority: 'AUTOEXEC_SCRIPT_SEARCH',
      type: 'detail'
    }
  },
  {
    path: '/script-add',
    name: 'script-add',
    component: scriptAdd,
    meta: {
      title: $t('router.autoexec.addscript'),
      ismenu: false,
      icon: 'tsfont-script',
      authority: 'AUTOEXEC_SCRIPT_MODIFY',
      type: 'detail'
    }
  },
  {
    path: '/tool-detail',
    name: 'toolDetail',
    component: toolDetail,
    meta: {
      title: $t('router.autoexec.toollibrarydetail'),
      ismenu: false,
      icon: 'tsfont-tool',
      authority: 'AUTOEXEC_SCRIPT_SEARCH',
      type: 'detail'
    }
  },
  {
    path: '/review-detail',
    name: 'reviewDetail',
    component: reviewDetail,
    meta: {
      title: $t('router.autoexec.customizetoolapproval'),
      ismenu: false,
      icon: 'tsfont-script',
      authority: 'AUTOEXEC_SCRIPT_SEARCH',
      type: 'detail'
    }
  },
  {
    path: '/test-detail',
    name: 'testDetail',
    component: testDetail,
    meta: {
      title: $t('router.autoexec.tooltestpage'),
      ismenu: false,
      icon: '',
      authority: 'AUTOEXEC_SCRIPT_MODIFY',
      type: 'detail'
    }
  },
  {
    path: '/operate-manage',
    name: 'operate-manage',
    component: operateManage,
    meta: {
      title: $t('router.autoexec.operationlevel'),
      ismenu: true,
      icon: 'tsfont-danger-level',
      authority: 'AUTOEXEC_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/type-manage',
    name: 'type-manage',
    component: typeManage,
    meta: {
      title: $t('router.autoexec.toolclassification'),
      ismenu: true,
      icon: 'tsfont-type',
      authority: 'AUTOEXEC_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/tool-catalog-manage',
    name: 'toolCatalogManage',
    component: toolCatalogManage,
    meta: {
      title: $t('router.autoexec.tooldirectory'),
      ismenu: true,
      icon: 'tsfont-list',
      authority: 'AUTOEXEC_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/tool-profile-manage',
    name: 'tool-profile-manage',
    component: toolProfileManage,
    meta: {
      title: $t('router.autoexec.presetparameterset'),
      ismenu: true,
      icon: 'tsfont-file-single',
      authority: 'AUTOEXEC_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/global-params-manage',
    name: 'global-params-manage',
    component: globalParamsManage,
    meta: {
      title: $t('router.autoexec.globalparameter'),
      ismenu: true,
      icon: 'tsfont-barlist',
      authority: 'AUTOEXEC_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/scene-definition-manage',
    name: 'scene-definition-manage',
    component: sceneDefinitionManage,
    meta: {
      title: $t('router.autoexec.scenedefinition'),
      ismenu: true,
      icon: 'tsfont-scene',
      authority: 'AUTOEXEC_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/customtemplate-manage',
    name: 'customtemplate-manage',
    component: customTemplateManage,
    meta: {
      title: $t('router.autoexec.customtemplate'),
      ismenu: true,
      icon: 'tsfont-plugin',
      authority: 'AUTOEXEC_CUSTOMTEMPLATE_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/service-catalog-manage',
    name: 'service-catalog-manage',
    component: serviceCatalogManage,
    meta: {
      title: $t('router.process.servicecatalog'),
      ismenu: true,
      icon: 'tsfont-star',
      authority: 'AUTOEXEC_BASE',
      type: 'quickService'
    }
  },
  {
    path: '/catalog-manage',
    name: 'catalog-manage',
    component: catalogManage,
    meta: {
      title: $t('router.autoexec.catalogmanage'),
      ismenu: true,
      icon: 'tsfont-list',
      authority: 'AUTOEXEC_SERVICE_MANAGE',
      type: 'quickService'
    }
  },
  {
    path: '/add-job',
    name: 'add-job',
    component: addJob,
    meta: {
      title: $t('router.autoexec.addjob'),
      ismenu: false,
      icon: '',
      authority: 'AUTOEXEC_BASE',
      type: 'quickService'
    }
  }
];
