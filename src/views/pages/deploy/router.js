const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const download = () => import('@/views/pages/common/download.vue');
const preview = () => import('@/views/pages/common/preview.vue');
const applicationConfigManage = () => import('./application-config/application-config-manage.vue'); // 应用配置
const versionCenterManage = () => import('./version/version-center-manage.vue'); // 版本中心
const versionDetail = () => import('./version/components/version-detail.vue'); // 版本详情
const applicationConfigPipeline = () => import('./application-config/application-config-pipeline.vue'); // 应用配置流水线
// 自动化
const actionDetail = () => import('@/views/pages/autoexec/detail/action-detail.vue'); // 组合工具详情
const scriptDetail = () => import('@/views/pages/autoexec/detail/script-detail.vue'); //自动化：自定义工具
const toolDetail = () => import('@/views/pages/autoexec/detail/tool-detail.vue');//自动化：工具
const testDetail = () => import('@/views/pages/autoexec/detail/test-detail.vue');//自动化：工具测试
const jobDetail = () => import('@/views/pages/autoexec/detail/job-detail.vue'); // 自动发现作业详情
// 自动化end
const publishingJobManage = () => import('./job/job-manage'); //一键发布
const publishingJobAdd = () => import('./job/job-add'); //新建发布作业
const batchPublishingJobEdit = () => import('./job/batch-job-edit.vue');//修改批量作业
const batchPublishingJobExecute = () => import('./job/batch-job-detail.vue');//执行批量作业
const pipelineDetail = () => import('./application-config/pipeline-detail.vue'); // 流水线详情
//超级流水线
const pipelineManage = () => import('./pipeline/pipeline-manage.vue');
const pipelineEdit = () => import('./pipeline/pipeline-edit.vue');
// 活动版本
const activeversionManage = () => import('./activeversion/activeversion-manage.vue');
//定时作业
const scheduleJobManage = () => import('./schedule/schedule-job-manage.vue');
const scheduleJobAdd = () => import('./schedule/schedule-job-add.vue');
const scheduleJobEdit = () => import('./schedule/schedule-job-edit.vue');

// 持续集成
const configAdd = () => import('./application-config/config/integrated/config-add.vue');

// 作业触发器
const jobWebhookManage = () => import('./webhook/job-webhook-manage.vue');
const jobWebhookEdit = () => import('./webhook/job-webhook-edit.vue');

// 工具分类
const toolClassificationManage = () => import('./toolclassification/tool-classification-manage.vue');

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
    path: '/download',
    name: 'download',
    component: download
  },
  {
    path: '/preview',
    name: 'preview',
    component: preview
  },
  {
    path: '/application-config-manage',
    name: 'application-config-manage',
    component: applicationConfigManage,
    meta: {
      title: $t('router.deploy.applicationconfig'),
      ismenu: true,
      icon: 'tsfont-file-multi',
      authority: 'DEPLOY_BASE',
      type: 'config'
    }
  },
  {
    path: '/version-center-manage',
    name: 'version-center-manage',
    component: versionCenterManage,
    meta: {
      title: $t('router.deploy.versioncenter'),
      ismenu: true,
      icon: 'tsfont-version',
      authority: 'DEPLOY_BASE',
      type: 'config'
    }
  },

  {
    path: '/version-detail',
    name: 'version-detail',
    component: versionDetail,
    meta: {
      title: $t('router.deploy.publishstatus'),
      ismenu: false,
      icon: '',
      authority: '',
      type: 'config'
    }
  },
  {

    path: '/application-config-pipeline',
    name: 'application-config-pipeline',
    component: applicationConfigPipeline,
    meta: {
      title: $t('router.deploy.applicationconfigpipeline'),
      ismenu: false,
      authority: '',
      type: 'config'
    }
  },
  {
    path: '/action-detail',
    name: 'action-detail',
    component: actionDetail,
    meta: {
      title: $t('router.deploy.combinationtooldetail'),
      ismenu: false,
      icon: '',
      authority: ''
    }
  },
  {
    path: '/script-detail',
    name: 'script-detail',
    component: scriptDetail,
    meta: {
      title: $t('router.deploy.publishstatus'),
      ismenu: false,
      authority: '',
      type: 'config'
    }
  },
  {
    path: '/tool-detail',
    name: 'tool-detail',
    component: toolDetail,
    meta: {
      title: $t('router.deploy.tooldetail'),
      ismenu: false,
      authority: 'AUTOEXEC_SCRIPT_SEARCH',
      type: 'config'
    }
  },
  {
    path: '/test-detail',
    name: 'test-detail',
    component: testDetail,
    meta: {
      title: $t('router.deploy.tooltestdetail'),
      ismenu: false,
      icon: '',
      authority: 'AUTOEXEC_BASE',
      type: 'config'
    }
  },
  {
    path: '/job-detail',
    name: 'job-detail',
    component: jobDetail,
    meta: {
      title: $t('router.deploy.jobdetail'),
      ismenu: false,
      icon: 'tsfont-history',
      authority: ''
    }
  },
  {
    path: '/job-manage',
    name: 'job-manage',
    component: publishingJobManage,
    meta: {
      title: $t('router.deploy.oneclickpublishing'),
      ismenu: true,
      icon: 'tsfont-history',
      authority: 'DEPLOY_BASE',
      type: 'job'
    }
  },
  {
    path: '/job-add',
    name: 'job-add',
    component: publishingJobAdd,
    meta: {
      title: $t('router.deploy.addpublishjob'),
      ismenu: false,
      icon: '',
      authority: '',
      type: 'job'
    }
  },
  {
    path: '/batch-job-edit',
    name: 'batch-job-edit',
    component: batchPublishingJobEdit,
    meta: {
      title: $t('router.deploy.editbatchpublishjob'),
      ismenu: false,
      authority: '',
      type: 'job'
    }
  },
  {
    path: '/batch-job-detail',
    name: 'batch-job-detail',
    component: batchPublishingJobExecute,
    meta: {
      title: $t('router.deploy.executebatchpublishjob'),
      ismenu: false,
      authority: '',
      type: 'job'
    }
  },
  {
    path: '/application-config-pipeline-detail',
    name: 'application-config-pipeline-detail',
    component: pipelineDetail,
    meta: {
      title: $t('router.deploy.pipelinedetail'),
      ismenu: false,
      icon: '',
      authority: '',
      type: 'config'
    }
  },
  {
    path: '/pipeline-manage',
    name: 'pipeline-manage',
    component: pipelineManage,
    meta: {
      title: $t('router.deploy.pipelinemanage'),
      ismenu: true,
      icon: 'tsfont-auto',
      authority: 'PIPELINE_MODIFY',
      type: 'job'
    }
  },
  {
    path: '/pipeline-edit',
    name: 'pipeline-edit',
    component: pipelineEdit,
    meta: {
      title: $t('router.deploy.editpipeline'),
      ismenu: false,
      authority: ''
    }
  },
  {
    path: '/activeversion-manage',
    name: 'activeversion-manage',
    component: activeversionManage,
    meta: {
      title: $t('router.deploy.activeversion'),
      ismenu: true,
      icon: 'tsfont-star-border',
      authority: 'DEPLOY_BASE',
      type: 'config'
    }
  },
  {
    path: '/schedule-job-manage',
    name: 'schedule-job-manage',
    component: scheduleJobManage,
    meta: {
      title: $t('router.deploy.schedulejob'),
      ismenu: true,
      icon: 'tsfont-formtime',
      authority: 'DEPLOY_BASE',
      type: 'job'
    }
  },
  {
    path: '/config-add',
    name: 'config-add',
    component: configAdd,
    meta: {
      title: $t('router.deploy.configadd'),
      ismenu: false,
      icon: '',
      authority: '',
      type: 'config'
    }
  },
  {
    path: '/schedule-job-add',
    name: 'schedule-job-add',
    component: scheduleJobAdd,
    meta: {
      title: $t('router.deploy.addschedulejob'),
      ismenu: false,
      authority: ''
    }
  },
  {
    path: '/schedule-job-edit',
    name: 'schedule-job-edit',
    component: scheduleJobEdit,
    meta: {
      title: $t('router.deploy.editschedulejob'),
      ismenu: false,
      authority: ''
    }
  },
  {
    path: '/tool-classification-manage',
    name: 'tool-classification-manage',
    component: toolClassificationManage,
    meta: {
      title: $t('router.deploy.toolclassification'),
      ismenu: true,
      icon: 'tsfont-setting',
      authority: 'DEPLOY_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/job-webhook-manage',
    name: 'job-webhook-manage',
    component: jobWebhookManage,
    meta: {
      title: $t('router.deploy.webhook'), // 作业触发器
      ismenu: true,
      icon: 'tsfont-webhook',
      authority: 'DEPLOY_MODIFY',
      type: 'config'
    }
  },
  {
    path: '/job-webhook-edit',
    name: 'job-webhook-edit',
    component: jobWebhookEdit,
    meta: {
      title: '',
      ismenu: false,
      authority: 'DEPLOY_MODIFY',
      type: 'config'
    }
  }
];
